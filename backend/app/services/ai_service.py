import os
import builtins

_SOFTSPACE_DEBUG_LOGS = os.getenv("SOFTSPACE_DEBUG_LOGS", "").strip().lower() in {
    "1",
    "true",
    "yes",
    "y",
    "on",
}

def _debug_print(*args, **kwargs):
    if _SOFTSPACE_DEBUG_LOGS:
        builtins.print(*args, **kwargs)

# Reduce log noise in production: ai_service.py contains many debug prints.
# Set SOFTSPACE_DEBUG_LOGS=1 to re-enable.
print = _debug_print  # type: ignore

from google import genai
from groq import Groq
from mistralai import Mistral
from app.config import settings
from app.database import supabase, supabase_admin
from typing import Dict, Optional, List
import json
from datetime import datetime, timedelta
from app.services.therapeutic_memory import TherapeuticMemory, format_memory_for_prompt

# ============================================================
# AI CLIENT INITIALIZATION
# ============================================================
# Architecture:
#   - Mistral Large: Main therapeutic chat (empathy, conversations)
#   - Groq Llama: Emotion extraction, post-processing, insights
#   - Gemini: Fallback only (limited free tier)
# ============================================================

gemini_client = genai.Client(api_key=settings.gemini_api_key)  # Fallback
groq_client = Groq(api_key=settings.groq_api_key)  # Emotion + Analytics
mistral_client = Mistral(api_key=settings.mistral_api_key)  # Main Chat

# Model constants
MISTRAL_CHAT_MODEL = "mistral-large-latest"  # Main therapeutic conversations
GROQ_EMOTION_MODEL = "llama-3.1-8b-instant"  # Fast emotion extraction
GROQ_ANALYSIS_MODEL = "llama-3.3-70b-versatile"  # Deep analysis & insights

# ============================================================
# USER CONTEXT MANAGEMENT
# ============================================================

async def get_user_context(user_id: str) -> Dict:
    """Fetch user's emotional context from database"""
    try:
        result = supabase_admin.table("context_cache")\
            .select("*")\
            .eq("user_id", user_id)\
            .single()\
            .execute()
        return result.data if result.data else {}
    except:
        return {}

async def update_user_context(
    user_id: str, 
    emotional_state: str, 
    stress_score: int, 
    summary: str,
    top_emotions: List[str] = None,
    top_triggers: List[str] = None
):
    """Update user's shared cognitive state using admin client (bypasses RLS)"""
    try:
        data = {
            "user_id": user_id,
            "last_emotional_state": emotional_state,
            "stress_score": stress_score,
            "recent_summary": summary,
            "updated_at": datetime.utcnow().isoformat()
        }
        # Only add optional fields if table supports them
        if top_emotions:
            try:
                data["top_emotions"] = top_emotions
            except:
                pass
        if top_triggers:
            try:
                data["top_triggers"] = top_triggers
            except:
                pass
            
        supabase_admin.table("context_cache").upsert(data).execute()
    except Exception as e:
        # Don't fail if context cache has schema issues - just log it
        print(f"Context update warning (non-critical): {e}")
        pass

# ============================================================
# CONTENT SAFETY FILTER (Pre-AI Check)
# ============================================================
# These patterns are checked BEFORE sending to AI to save costs
# and ensure immediate, consistent responses to inappropriate content.

NSFW_KEYWORDS = [
    # Explicit sexual content
    "porn", "pornography", "xxx", "hentai", "nude", "nudes", "naked",
    "sex video", "sex tape", "onlyfans", "fansly", "chaturbate",
    "masturbat", "jerk off", "jack off", "orgasm", "erotic",
    "blow job", "blowjob", "handjob", "hand job", "anal", "vaginal",
    "penis", "dick pic", "cock", "pussy", "tits", "boobs",
    "sexual position", "kink", "fetish", "bdsm", "bondage",
    # Illegal/harmful
    "incest", "underage", "minor", "child porn", "cp", "pedo",
    "rape", "molest", "abuse child", "traffick",
    # Violence
    "how to kill", "murder", "torture", "hurt someone",
    # Drugs
    "buy drugs", "get cocaine", "get heroin", "buy meth",
]

NSFW_PHRASES = [
    "recommend me porn", "recommend porn", "suggest porn",
    "good porn", "best porn", "find porn", "show porn",
    "send nudes", "show me naked", "sexual content",
    "have sex with", "sleep with me", "role play sex",
    "erotic story", "write erotica", "sexual fantasy",
]

def check_content_safety(text: str) -> dict:
    """
    Pre-check message for inappropriate content before AI processing.
    Returns: {"safe": bool, "reason": str or None, "category": str or None}
    """
    text_lower = text.lower().strip()
    
    # Check exact phrases first (higher confidence)
    for phrase in NSFW_PHRASES:
        if phrase in text_lower:
            return {
                "safe": False,
                "reason": "inappropriate_request",
                "category": "nsfw"
            }
    
    # Check keywords (with word boundary awareness)
    words = set(text_lower.split())
    for keyword in NSFW_KEYWORDS:
        # For multi-word keywords, check if they appear as substring
        if " " in keyword:
            if keyword in text_lower:
                return {
                    "safe": False,
                    "reason": "inappropriate_content",
                    "category": "nsfw"
                }
        else:
            # For single words, check word boundaries to reduce false positives
            if keyword in words or any(keyword in word for word in words):
                # Avoid false positives for clinical discussion
                clinical_context = ["addiction", "recovery", "struggle", "overcome", 
                                   "therapy", "therapist", "help with", "dealing with"]
                if not any(ctx in text_lower for ctx in clinical_context):
                    return {
                        "safe": False,
                        "reason": "inappropriate_content", 
                        "category": "nsfw"
                    }
    
    return {"safe": True, "reason": None, "category": None}

# Standard response for blocked content
CONTENT_BLOCKED_RESPONSE = """I'm not able to help with that kind of request. My purpose is to provide therapeutic support for your mental health and emotional wellbeing.

If you're going through something difficult, I'm here to listen without judgment. Is there something on your mind you'd like to talk about? Maybe how you're feeling today, or something that's been weighing on you?"""

# ============================================================
# EMOTION EXTRACTION SERVICE (Core Intelligence)
# ============================================================

# Short/neutral phrases that don't need deep analysis
NEUTRAL_PHRASES = {
    "hello", "hi", "hey", "ok", "okay", "sure", "yes", "no", "thanks", 
    "thank you", "bye", "goodbye", "good", "fine", "alright", "yep", "nope",
    "cool", "nice", "great", "got it", "understood", "hmm", "hm", "oh",
    "i see", "ah", "uh", "um", "lol", "haha", "yeah", "nah", "k"
}

def is_short_neutral_message(text: str) -> bool:
    """Check if message is too short/neutral to analyze for emotions"""
    cleaned = text.lower().strip().rstrip('?!.,')
    # If it's a known neutral phrase or very short
    if cleaned in NEUTRAL_PHRASES or len(cleaned) < 4:
        return True
    # If it's just a few words and doesn't contain emotional keywords
    words = cleaned.split()
    if len(words) <= 2:
        emotional_keywords = {"sad", "happy", "angry", "anxious", "scared", "worried", 
                             "stressed", "depressed", "hurt", "upset", "frustrated",
                             "lonely", "hopeless", "overwhelmed", "tired", "exhausted"}
        if not any(word in emotional_keywords for word in words):
            return True
    return False

# CRISIS KEYWORDS - Explicit detection (backup to AI)
# NOTE: These are checked WITH CONTEXT - see detect_crisis_keywords_smart()
CRISIS_KEYWORDS_IMMEDIATE = [
    "kill myself", "end my life", "want to die", "better off dead",
    "no reason to live", "can't go on", "going to hurt myself", "end it all",
    "planning to kill", "going to kill myself", "i will kill myself"
]

CRISIS_KEYWORDS_HIGH = [
    "suicidal thoughts", "self harm", "cut myself", "hurt myself", "no point in living",
    "can't take it anymore", "want it to end", "overdose", "hang myself"
]

CRISIS_KEYWORDS_MODERATE = [
    "panic attack", "crisis", "can't breathe", "losing control",
    "terrified", "breaking down", "falling apart"
]

# STANDALONE CRISIS WORDS that need context analysis
CRISIS_WORDS_NEED_CONTEXT = [
    "suicide", "suicidal", "kill", "die", "death", "dead", "harm", "hurt"
]

# ============================================================
# CONTEXT-AWARE CRISIS DETECTION (Professional Grade)
# ============================================================
# Professional platforms use multi-signal analysis:
# 1. First-person vs third-person detection
# 2. Negation/prevention context
# 3. Professional/clinical context
# 4. Positive intent markers
# 5. Topic discussion vs personal expression

# Phrases that NEGATE crisis when combined with crisis words
CRISIS_NEGATION_PHRASES = [
    # Prevention context
    "prevent suicide", "suicide prevention", "preventing suicide",
    "stop suicide", "reduce suicide", "combat suicide",
    "prevent suicides", "preventing suicides",
    # Help/support context  
    "help with suicide", "help people who", "help those who",
    "support for suicide", "resources for suicide",
    "save lives", "saving lives", "help save",
    # Professional/work context
    "working on", "building", "creating", "developing", "designing",
    "platform for", "app for", "tool for", "service for",
    "volunteer", "volunteering", "nonprofit", "non-profit", "charity",
    "therapist", "counselor", "psychologist", "psychiatrist", "clinician",
    "mental health professional", "crisis counselor", "hotline",
    "research on", "studying", "study about", "learning about",
    # Discussion/abstract context
    "talk about suicide", "discussing suicide", "conversation about",
    "awareness about", "awareness for", "education about",
    "the topic of", "the issue of", "the problem of",
    "rates of suicide", "suicide rates", "statistics",
    # Third-person/others context
    "people who", "those who", "someone who", "anyone who",
    "others who", "individuals who", "patients who", "clients who",
    "help them", "help others", "support others", "support them",
]

# Phrases that STRONGLY indicate personal crisis (first-person + intent)
PERSONAL_CRISIS_INDICATORS = [
    # First-person + action intent
    "i want to kill myself", "i want to die", "i'm going to kill myself",
    "i am going to kill myself", "i will kill myself", "i'm gonna kill myself",
    "i want to end my life", "i want to end it all", "i'm ending it",
    "i can't go on", "i can't do this anymore", "i give up on life",
    "i don't want to be alive", "i don't want to live", "i wish i was dead",
    "i wish i were dead", "i'd be better off dead", "everyone would be better off",
    "no one would miss me", "no one cares if i", "nobody would care",
    # Self-harm intent
    "i'm going to hurt myself", "i want to hurt myself", "i cut myself",
    "i'm cutting", "i've been cutting", "i harm myself", "i self-harm",
    # Hopelessness + finality
    "there's no point anymore", "nothing matters anymore", "i've given up",
    "this is goodbye", "my final", "before i go", "when i'm gone",
]

# Professional/clinical context indicators
PROFESSIONAL_CONTEXT_INDICATORS = [
    "platform", "app", "application", "website", "tool", "service", "product",
    "startup", "company", "organization", "nonprofit", "charity",
    "volunteer", "volunteering", "intern", "internship",
    "therapist", "counselor", "psychologist", "psychiatrist", "doctor",
    "nurse", "social worker", "mental health", "healthcare", "clinic",
    "research", "study", "academic", "university", "thesis", "paper",
    "training", "certification", "course", "class", "learning",
    "hotline", "helpline", "crisis line", "988", "lifeline",
    "prevention", "awareness", "education", "outreach", "advocacy",
]

def detect_crisis_keywords_smart(text: str) -> tuple[str, list[str], str]:
    """
    Context-aware crisis detection using professional-grade multi-signal analysis.
    
    Returns: (crisis_level, detected_keywords, reasoning)
    
    Approach:
    1. Check for explicit first-person crisis phrases (highest priority)
    2. Check if crisis words appear in negated/professional context
    3. Apply weighted scoring based on multiple signals
    """
    text_lower = text.lower()
    detected = []
    reasoning = ""
    
    # ============================================================
    # STEP 1: Check for explicit first-person crisis indicators
    # These are high-confidence personal distress signals
    # ============================================================
    for phrase in PERSONAL_CRISIS_INDICATORS:
        if phrase in text_lower:
            detected.append(phrase)
            reasoning = f"First-person crisis expression detected: '{phrase}'"
            print(f"🚨 CRISIS: Personal indicator found: '{phrase}'")
            return "immediate", detected, reasoning
    
    # ============================================================
    # STEP 2: Check for negation/professional context
    # If crisis words appear with these, it's likely NOT a crisis
    # ============================================================
    has_negation_context = any(phrase in text_lower for phrase in CRISIS_NEGATION_PHRASES)
    has_professional_context = any(indicator in text_lower for indicator in PROFESSIONAL_CONTEXT_INDICATORS)
    
    # ============================================================
    # STEP 3: Check for crisis keywords with context awareness
    # ============================================================
    
    # Check immediate-level phrases first
    for keyword in CRISIS_KEYWORDS_IMMEDIATE:
        if keyword in text_lower:
            # If in negation/professional context, it's likely false positive
            if has_negation_context or has_professional_context:
                reasoning = f"Keyword '{keyword}' found but in professional/prevention context - NOT a crisis"
                print(f"ℹ️ FALSE POSITIVE AVOIDED: '{keyword}' in context: negation={has_negation_context}, professional={has_professional_context}")
                return "none", [], reasoning
            detected.append(keyword)
            reasoning = f"Crisis phrase detected without negating context: '{keyword}'"
            return "immediate", detected, reasoning
    
    # Check high-level phrases
    for keyword in CRISIS_KEYWORDS_HIGH:
        if keyword in text_lower:
            if has_negation_context or has_professional_context:
                reasoning = f"Keyword '{keyword}' found but in professional/prevention context"
                print(f"ℹ️ FALSE POSITIVE AVOIDED: '{keyword}' in professional context")
                return "none", [], reasoning
            detected.append(keyword)
    
    if detected:
        reasoning = f"High-level crisis indicators found: {detected}"
        return "high", detected, reasoning
    
    # Check standalone crisis words that need context
    crisis_words_found = []
    for word in CRISIS_WORDS_NEED_CONTEXT:
        if word in text_lower:
            crisis_words_found.append(word)
    
    if crisis_words_found:
        # These words ONLY trigger crisis if NOT in negation/professional context
        if has_negation_context or has_professional_context:
            reasoning = f"Crisis words {crisis_words_found} found but clearly in professional/prevention context"
            print(f"ℹ️ FALSE POSITIVE AVOIDED: Words {crisis_words_found} in safe context")
            return "none", [], reasoning
        
        # Additional check: Is this first-person?
        first_person_markers = ["i ", "i'm ", "im ", "i am ", "my ", "myself", "i've ", "ive "]
        is_first_person = any(marker in text_lower for marker in first_person_markers)
        
        # Third-person discussion is usually not crisis
        third_person_markers = ["people", "someone", "others", "they", "them", "those", "patients", "clients", "users"]
        is_third_person = any(marker in text_lower for marker in third_person_markers)
        
        if is_third_person and not is_first_person:
            reasoning = f"Crisis words {crisis_words_found} in third-person context (discussing others)"
            print(f"ℹ️ FALSE POSITIVE AVOIDED: Third-person discussion")
            return "none", [], reasoning
        
        # If first-person with crisis words but no clear intent phrases, flag as moderate
        if is_first_person:
            reasoning = f"Crisis words {crisis_words_found} with first-person context - needs attention"
            return "moderate", crisis_words_found, reasoning
    
    # Check moderate keywords
    for keyword in CRISIS_KEYWORDS_MODERATE:
        if keyword in text_lower:
            detected.append(keyword)
    
    if detected:
        reasoning = f"Moderate distress indicators: {detected}"
        return "moderate", detected, reasoning
    
    return "none", [], "No crisis indicators detected"


# Keep old function for backward compatibility but use smart version
def detect_crisis_keywords(text: str) -> tuple[str, list[str]]:
    """Wrapper for backward compatibility - uses smart detection"""
    level, keywords, reasoning = detect_crisis_keywords_smart(text)
    if reasoning:
        print(f"🔍 Crisis analysis: {reasoning}")
    return level, keywords

# ============================================================
# ADDITIONAL CRISIS ANALYSIS HELPERS
# ============================================================

# Terms that indicate strong crisis when found (used for AI output validation)
STRONG_CRISIS_TERMS = set(
    term.lower() for term in (
        CRISIS_KEYWORDS_IMMEDIATE
        + CRISIS_KEYWORDS_HIGH
        + PERSONAL_CRISIS_INDICATORS[:10]  # First 10 personal indicators
    )
)

# NON-CRISIS TERMS: Normal struggles, NOT crisis indicators by themselves
NON_CRISIS_TERMS = {
    "procrastinate", "procrastination", "procrastinating",
    "self-doubt", "doubt myself", "insecure", "insecurity",
    "lazy", "unmotivated", "not productive", "unproductive",
    "distracted", "unfocused", "tired", "exhausted", "bored",
    "stressed", "anxious", "worried", "nervous", "overwhelmed",
    "frustrated", "annoyed", "irritated", "disappointed",
    "sad", "down", "blue", "lonely", "isolated",
    "confused", "lost", "stuck", "uncertain"
}

# RESILIENCE/SELF-COMPASSION INDICATORS: Signs the user is coping well
RESILIENCE_INDICATORS = [
    "don't feel bad", "dont feel bad", "i'm okay", "im okay", "i am okay",
    "it's okay", "its okay", "it's fine", "its fine", "i'm fine", "im fine",
    "not beating myself up", "being kind to myself", "self-compassion",
    "learning from", "moving forward", "it happens", "that's okay",
    "i accept", "i'm at peace", "at peace with", "letting go",
    "not stressed about", "not worried about", "don't mind",
    "comfortable with", "accepting", "forgiving myself",
    "it's not a big deal", "not a big deal", "whatever", "oh well",
    "tomorrow is a new day", "fresh start", "will do better"
]

def has_resilience_indicators(text: str) -> bool:
    """Check if the message contains signs of self-compassion or coping well."""
    text_lower = text.lower()
    return any(indicator in text_lower for indicator in RESILIENCE_INDICATORS)

def contains_only_non_crisis_terms(crisis_keywords: List[str]) -> bool:
    """Check if all detected 'crisis' keywords are actually non-crisis normal struggles."""
    if not crisis_keywords:
        return True
    return all(
        any(non_crisis in kw.lower() or kw.lower() in non_crisis 
            for non_crisis in NON_CRISIS_TERMS)
        for kw in crisis_keywords
    )

async def extract_emotions_from_text(text: str) -> Dict:
    """
    Use Gemini to deeply analyze emotions, sentiment, and topics from text.
    Smart handling for short/neutral messages - skips expensive API calls.
    Enhanced with crisis detection (keyword-based + AI).
    """
    # FIRST: Check for explicit crisis keywords (immediate detection)
    keyword_crisis_level, keyword_crisis_words = detect_crisis_keywords(text)
    
    # Skip analysis for short neutral messages (unless crisis detected)
    if is_short_neutral_message(text) and keyword_crisis_level == "none":
        return {
            "primary_emotion": "neutral",
            "secondary_emotions": [],
            "emotion_scores": {"neutral": 90},
            "valence": 0.0,  # Neutral on pleasant/unpleasant
            "arousal": 0.0,  # Neutral on calm/activated
            "mood_score": 5,
            "sentiment": "neutral",
            "intensity": 1,
            "topics": [],
            "triggers": [],
            "needs_support": False,
            "crisis_level": "none",
            "crisis_keywords": [],
            "suggested_approach": "Continue the conversation naturally"
        }
    
    prompt = f"""Analyze this text for emotional content using a professional psychological framework. Return ONLY valid JSON.

Text: "{text}"

=== CIRCUMPLEX MODEL (Dimensional) ===
Rate on two dimensions:
- Valence: -1.0 (very negative) to +1.0 (very positive) - how pleasant/unpleasant
- Arousal: -1.0 (very calm/low energy) to +1.0 (very activated/high energy)

Examples:
- Happy/Excited: valence=0.8, arousal=0.7
- Calm/Content: valence=0.5, arousal=-0.3
- Anxious/Stressed: valence=-0.4, arousal=0.6
- Sad/Depressed: valence=-0.6, arousal=-0.4
- Angry: valence=-0.5, arousal=0.8
- Neutral greeting: valence=0.1, arousal=0.0

=== MULTI-EMOTION DETECTION ===
People often feel multiple emotions. Provide confidence scores (0-100%) for detected emotions.
Only include emotions with >20% confidence.

=== CRISIS DETECTION (be VERY careful to avoid false positives) ===
- "immediate" = ONLY explicit suicide ideation, active self-harm intent, severe hopelessness with plan
- "high" = persistent suicidal thoughts, feeling completely trapped, substance abuse crisis
- "moderate" = ONLY passive death wishes, self-harm urges, extreme uncontrollable distress
- "low" = general distress, struggling but coping
- "none" = no crisis signs OR user shows self-compassion/resilience

FALSE POSITIVE PREVENTION:
- Procrastination, self-doubt, laziness, unproductive = NOT crisis (use "none")
- Normal sadness, frustration, anxiety, stress = NOT crisis unless severe
- If user says "don't feel bad", "it's okay", shows self-acceptance = "none"
- NEUTRAL GREETINGS like "hi", "logging in", "daily update" = "none" with neutral emotions

Return this exact JSON structure:
{{
    "primary_emotion": "the strongest emotion detected",
    "emotion_scores": {{
        "emotion_name": confidence_percentage,
        "another_emotion": confidence_percentage
    }},
    "valence": float between -1.0 and 1.0,
    "arousal": float between -1.0 and 1.0,
    "mood_score": 1-10 (1=very negative, 10=very positive),
    "sentiment": "positive|negative|neutral|mixed",
    "intensity": 1-10 (how strong overall),
    "topics": ["specific therapeutic topics only - NOT generic words like 'update', 'well-being', 'check-in'"],
    "triggers": ["potential triggers"],
    "needs_support": true/false,
    "crisis_level": "none|low|moderate|high|immediate",
    "crisis_keywords": ["crisis words if any"],
    "suggested_approach": "therapeutic response suggestion"
}}

IMPORTANT: For topics, ONLY include SPECIFIC issues (e.g., 'work stress', 'relationship conflict', 'sleep problems').
DO NOT include generic words like: 'update', 'well-being', 'check-in', 'feeling', 'mental health', 'today', 'help'.
If the message is just a greeting or general update with no specific topic, return empty topics array."""

    try:
        # Use Groq Llama for fast emotion extraction
        completion = groq_client.chat.completions.create(
            model=GROQ_EMOTION_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=512
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Clean up response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        analysis = json.loads(response_text)
        
        # Ensure all required fields exist with defaults
        if "crisis_level" not in analysis:
            analysis["crisis_level"] = "none"
        if "crisis_keywords" not in analysis:
            analysis["crisis_keywords"] = []
        if "emotion_scores" not in analysis:
            # Fallback: create from primary/secondary emotions
            primary = analysis.get("primary_emotion", "neutral")
            analysis["emotion_scores"] = {primary: 80}
            for secondary in analysis.get("secondary_emotions", []):
                analysis["emotion_scores"][secondary] = 40
        if "valence" not in analysis:
            # Infer from mood_score: 1-10 maps to -1 to +1
            mood = analysis.get("mood_score", 5)
            analysis["valence"] = round((mood - 5.5) / 4.5, 2)
        if "arousal" not in analysis:
            # Infer from intensity: 1-10 maps to -1 to +1
            intensity = analysis.get("intensity", 5)
            analysis["arousal"] = round((intensity - 5.5) / 4.5, 2)
        
        # Ensure secondary_emotions exists for backward compatibility
        if "secondary_emotions" not in analysis:
            # Extract from emotion_scores (all except primary)
            primary = analysis.get("primary_emotion", "neutral")
            analysis["secondary_emotions"] = [
                e for e in analysis.get("emotion_scores", {}).keys() 
                if e != primary
            ]
        
        # Filter out generic/common words from topics
        GENERIC_TOPIC_WORDS = {
            "update", "well-being", "wellbeing", "check-in", "checkin", 
            "feeling", "feelings", "mental health", "today", "help", 
            "support", "chat", "talk", "conversation", "daily", "general",
            "life", "things", "stuff", "situation", "everything"
        }
        if "topics" in analysis:
            analysis["topics"] = [
                topic for topic in analysis["topics"]
                if topic.lower() not in GENERIC_TOPIC_WORDS
            ]
        
        # MERGE keyword-based detection with AI detection (take higher severity)
        crisis_levels_rank = {"none": 0, "low": 1, "moderate": 2, "high": 3, "immediate": 4}
        ai_crisis_rank = crisis_levels_rank.get(analysis["crisis_level"], 0)
        keyword_crisis_rank = crisis_levels_rank.get(keyword_crisis_level, 0)
        
        if keyword_crisis_rank > ai_crisis_rank:
            analysis["crisis_level"] = keyword_crisis_level
            analysis["crisis_keywords"] = list(set(analysis["crisis_keywords"] + keyword_crisis_words))
            print(f"⚠️ CRISIS DETECTED via keywords: {keyword_crisis_level} - {keyword_crisis_words}")
        elif ai_crisis_rank > 0:
            print(f"⚠️ CRISIS DETECTED via AI: {analysis['crisis_level']}")

        # Post-process to reduce false positives (e.g., procrastination, self-doubt)
        ai_crisis_terms = [kw.lower() for kw in analysis.get("crisis_keywords", [])]
        has_strong_ai_term = any(
            strong in term or term in strong
            for term in ai_crisis_terms
            for strong in STRONG_CRISIS_TERMS
        )
        
        # Check for resilience/self-compassion indicators
        shows_resilience = has_resilience_indicators(text)
        only_non_crisis = contains_only_non_crisis_terms(analysis.get("crisis_keywords", []))
        
        # DOWNGRADE LOGIC:
        # 1. If AI detected crisis but no explicit keywords AND no strong crisis terms → downgrade
        # 2. If user shows resilience/self-compassion AND only has non-crisis terms → downgrade to none
        # 3. If the detected keywords are all non-crisis struggles → downgrade
        
        if analysis["crisis_level"] in ["moderate", "high", "immediate"]:
            should_downgrade = False
            downgrade_reason = ""
            
            # Case 1: AI-only detection without strong terms
            if keyword_crisis_level == "none" and not has_strong_ai_term:
                should_downgrade = True
                downgrade_reason = "AI-only detection without explicit crisis keywords"
            
            # Case 2: User shows resilience with only non-crisis terms
            if shows_resilience and only_non_crisis:
                should_downgrade = True
                downgrade_reason = "User shows self-compassion/resilience"
                analysis["crisis_level"] = "none"  # Full downgrade for resilient users
            
            # Case 3: All detected terms are normal struggles, not crises
            if only_non_crisis and not has_strong_ai_term:
                should_downgrade = True
                downgrade_reason = "Detected terms are normal struggles, not crisis indicators"
            
            if should_downgrade:
                if analysis["crisis_level"] != "none":  # May have been set to none above
                    analysis["crisis_level"] = "low" if not shows_resilience else "none"
                print(f"ℹ️ Downgrading crisis to '{analysis['crisis_level']}': {downgrade_reason}")
                print(f"   - Original terms: {ai_crisis_terms}")
                print(f"   - Shows resilience: {shows_resilience}")
            
        return analysis
    except Exception as e:
        print(f"Emotion extraction error: {e}")
        return {
            "primary_emotion": "neutral",
            "secondary_emotions": [],
            "emotion_scores": {"neutral": 80},
            "valence": 0.0,
            "arousal": 0.0,
            "mood_score": 5,
            "sentiment": "neutral",
            "intensity": 5,
            "topics": [],
            "triggers": [],
            "needs_support": False,
            "crisis_level": "none",
            "crisis_keywords": [],
            "suggested_approach": "Listen and validate"
        }

async def log_emotion(
    user_id: str,
    source: str,
    source_id: int,
    emotion_data: Dict
):
    """Log extracted emotions to the emotion_logs table for analytics.
    
    Your emotion_logs schema has:
    id, user_id, source, source_id, primary_emotion, mood_score, 
    sentiment, triggers, topics, timestamp
    """
    try:
        supabase_admin.table("emotion_logs").insert({
            "user_id": user_id,
            "source": source,
            "source_id": source_id,
            "primary_emotion": emotion_data.get("primary_emotion", "neutral"),
            "mood_score": emotion_data.get("mood_score", 5),
            "sentiment": emotion_data.get("sentiment", "neutral"),
            "triggers": emotion_data.get("triggers", []),
            "topics": emotion_data.get("topics", [])
        }).execute()
    except Exception as e:
        print(f"Emotion logging failed: {e}")

# ============================================================
# CHAT SESSION MANAGEMENT
# ============================================================

async def create_chat_session(user_id: str, initial_message: str = None) -> int:
    """Create a new chat session and mark previous sessions as inactive"""
    try:
        # Mark all existing sessions as inactive
        try:
            supabase_admin.table("chat_sessions")\
                .update({"is_active": False})\
                .eq("user_id", user_id)\
                .eq("is_active", True)\
                .execute()
        except Exception as e:
            print(f"Failed to mark old sessions inactive: {e}")
        
        # Create new active session
        result = supabase_admin.table("chat_sessions").insert({
            "user_id": user_id,
            "title": "New Chat",
            "is_active": True
        }).execute()
        
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Session creation failed: {e}")
        return None

async def get_or_create_active_session(user_id: str) -> Optional[int]:
    """Get the active session or create a new one. Returns None if sessions not enabled."""
    try:
        # First check for existing active session
        result = supabase_admin.table("chat_sessions")\
            .select("id")\
            .eq("user_id", user_id)\
            .eq("is_active", True)\
            .order("updated_at", desc=True)\
            .limit(1)\
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]["id"]
        
        # Create new session
        return await create_chat_session(user_id)
    except Exception as e:
        print(f"Session retrieval failed: {e}")
        return None  # Return None instead of trying to create

async def update_session_title(session_id: Optional[int], first_message: str):
    """Generate and update session title based on first message using Groq"""
    if not session_id:
        return
        
    try:
        prompt = f"""Create a short, descriptive title (3-5 words max) for a therapy chat session that started with this message:
"{first_message}"

Return ONLY the title, nothing else. Examples:
- Managing Work Stress
- Sleep and Anxiety
- Feeling Overwhelmed Today
- Processing Difficult Emotions"""

        # Use Groq for quick title generation
        completion = groq_client.chat.completions.create(
            model=GROQ_EMOTION_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=20
        )
        
        title = completion.choices[0].message.content.strip()[:50]
        
        supabase_admin.table("chat_sessions")\
            .update({"title": title})\
            .eq("id", session_id)\
            .execute()
    except Exception as e:
        print(f"Title update failed: {e}")

async def update_session_analytics(session_id: Optional[int], emotion_data: Dict):
    """Update session with aggregated emotional data"""
    if not session_id:
        return
        
    try:
        supabase_admin.table("chat_sessions").update({
            "primary_emotion": emotion_data.get("primary_emotion"),
            "topics": emotion_data.get("topics", [])[:5],  # Top 5 topics
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", session_id).execute()
    except Exception as e:
        print(f"Session analytics update failed: {e}")

async def get_session_messages(session_id: int) -> List[Dict]:
    """Get all messages in a session for context"""
    try:
        result = supabase_admin.table("conversations")\
            .select("message, response, emotional_tone, created_at")\
            .eq("session_id", session_id)\
            .order("created_at", desc=False)\
            .limit(20)\
            .execute()
        return result.data if result.data else []
    except:
        return []

# ============================================================
# MAIN CHAT WITH MISTRAL (Therapeutic Conversations)
# ============================================================

async def chat_with_mistral(
    user_message: str, 
    user_id: str, 
    session_id: int = None
) -> Dict:
    """
    Use Mistral Large for empathetic, therapeutic conversations.
    Architecture: Content Filter → Groq (emotions) → Therapeutic Memory → Mistral (chat) → Response
    """
    # ============================================================
    # CONTENT SAFETY CHECK - First line of defense
    # ============================================================
    safety_check = check_content_safety(user_message)
    if not safety_check["safe"]:
        print(f"⚠️ Content blocked: {safety_check['category']} - User: {user_id}")
        # Still create/use session so conversation flow works
        if not session_id:
            session_id = await create_chat_session(user_id)
        return {
            "response": CONTENT_BLOCKED_RESPONSE,
            "session_id": session_id,
            "emotional_tone": "neutral",
            "mood_score": 5,
            "sentiment": "neutral",
            "detected_topics": [],
            "needs_support": False,
            "crisis_level": "none",
            "crisis_keywords": [],
            "model_used": "safety_filter",
            "suggested_goal": None,
            "content_filtered": True
        }
    
    # Session selection:
    # If the caller didn't provide a session, start a new one so it appears as a separate entry.
    if not session_id:
        session_id = await create_chat_session(user_id)
    
    # Get session history for context
    history = await get_session_messages(session_id)
    history_text = "\n".join([
        f"User: {m['message']}\nAssistant: {m['response']}" 
        for m in history[-5:]  # Last 5 exchanges
    ]) if history else "No previous messages"
    
    # Extract emotions from user message (using Groq)
    emotion_data = await extract_emotions_from_text(user_message)
    
    # Check for crisis level
    crisis_level = emotion_data.get("crisis_level", "none")
    crisis_keywords = emotion_data.get("crisis_keywords", [])
    
    # LOG CRISIS DETECTION
    if crisis_level in ["high", "immediate"]:
        print(f"\n{'='*60}")
        print(f"🚨 CRISIS ALERT: {crisis_level.upper()} level detected")
        print(f"User ID: {user_id}")
        print(f"Keywords: {crisis_keywords}")
        print(f"Message: {user_message[:100]}...")
        print(f"{'='*60}\n")
    
    # Get user context - but only use for longitudinal patterns, NOT current emotional state
    context = await get_user_context(user_id)
    
    # ============================================================
    # THERAPEUTIC MEMORY - Long-term continuity
    # ============================================================
    therapeutic_memory = TherapeuticMemory(user_id)
    memory_context = await therapeutic_memory.build_therapeutic_context()
    memory_prompt = await format_memory_for_prompt(memory_context)
    
    # Track themes from current message
    detected_topics = emotion_data.get("topics", [])
    primary_emotion = emotion_data.get("primary_emotion", "neutral")
    if detected_topics and session_id:
        await therapeutic_memory.track_themes(detected_topics, session_id, primary_emotion)
    
    # Detect patterns and get intervention suggestion
    pattern_alert = await therapeutic_memory.detect_patterns(
        primary_emotion,
        detected_topics,
        emotion_data.get("intensity", 5)
    )
    
    # ============================================================
    # SMART GOAL REMINDERS (non-intrusive, context-aware)
    # ============================================================
    goal_reminder = await therapeutic_memory.check_goal_reminder()
    goal_reminder_guidance = ""
    if goal_reminder:
        goal_reminder_guidance = f"""
=== GENTLE GOAL REMINDER ===
The user has a goal related to "{goal_reminder.get('category', 'wellbeing')}": "{goal_reminder.get('goal_text', '')}"
Context trigger: {goal_reminder.get('trigger', 'relevance')}

Suggested gentle nudge (weave naturally into your response if appropriate):
"{goal_reminder.get('gentle_nudge', '')}"

IMPORTANT: Only include this if it feels natural. Do NOT force it if the conversation 
is emotionally heavy or the user is in distress. The reminder should feel like 
a caring observation, not a nag.
"""
    
    # ============================================================
    # GOAL DETECTION (suggest goals from conversation)
    # ============================================================
    suggested_goal = await therapeutic_memory.detect_potential_goal(
        user_message, 
        detected_topics, 
        primary_emotion
    )
    # This will be returned in the response for frontend to show a subtle prompt
    
    # Determine if this is a new/fresh session (no history yet)
    is_new_session = len(history) == 0
    
    # Build crisis-aware prompt
    crisis_guidance = ""
    if crisis_level in ["immediate", "high"]:
        crisis_guidance = """
⚠️ CRISIS PROTOCOL ACTIVE ⚠️
The user has shown signs of crisis or suicidal ideation. Your response MUST:
1. Express immediate concern and care
2. Directly ask about safety: "Are you thinking about hurting yourself right now?"
3. Provide specific crisis resources:
   - 988 Suicide & Crisis Lifeline (call or text)
   - Crisis Text Line: Text HELLO to 741741
   - Emergency services: 911
4. Remind them they're not alone and help is available
5. Avoid minimizing their pain or offering platitudes
6. Stay present and engaged
"""
    elif crisis_level == "moderate":
        crisis_guidance = """
⚠️ ELEVATED CONCERN
The user is showing signs of significant distress. Your response should:
1. Validate their pain without judgment
2. Gently check in on their safety
3. Offer coping strategies if appropriate
4. Mention that professional help is available (988 Lifeline)
5. Stay compassionate and present
"""
    
    # Build pattern intervention guidance
    pattern_guidance = ""
    if pattern_alert:
        pattern_guidance = f"""
GENTLE PATTERN AWARENESS (handle with care):
Type: {pattern_alert.get('pattern_type', 'unknown')}
Suggested gentle response: "{pattern_alert.get('intervention', '')}"
{'Offer a grounding exercise if they seem open to it.' if pattern_alert.get('offer_grounding') else ''}

IMPORTANT: This is NOT a diagnosis. It's an observation to help you be more attuned.
- Never say "You're spiraling again" or "You always do this"
- DO say things like "I notice we've touched on this before, and it sounds just as heavy"
- Be curious, not clinical. Be present, not prescriptive.
"""
    
    # Get current date/time for real-time awareness
    from datetime import datetime
    now = datetime.now()
    current_date = now.strftime("%A, %B %d, %Y")  # e.g., "Wednesday, December 25, 2025"
    current_time = now.strftime("%I:%M %p")  # e.g., "02:30 PM"
    current_year = now.year
    
    # Build therapeutic system instructions for Mistral
    system_instructions = f"""You are a compassionate AI mental health companion providing therapeutic support.

=== CRITICAL SAFETY BOUNDARIES - STRICTLY ENFORCED ===
You MUST immediately and firmly decline the following WITHOUT EXCEPTION:
1. ANY sexual content, pornography, or explicit material requests
2. Requests for content involving minors in any inappropriate context
3. Requests to help with illegal activities, violence, or harm to others
4. Dating advice, relationship matchmaking, or romantic role-play
5. Medical diagnoses or medication recommendations
6. Financial, legal, or professional advice outside mental wellness

When you encounter such requests:
- Do NOT engage with or validate the request as a "feeling" to explore
- Do NOT provide alternatives or "safer" versions of inappropriate content
- Do NOT analyze why they might be asking or empathize with the urge
- Simply state: "I'm not able to help with that. I'm here to support your mental health and emotional wellbeing. Is there something you'd like to talk about?"
- If they persist, redirect firmly: "My purpose is therapeutic support. I can help with stress, anxiety, emotions, or just being a supportive listener. What's really on your mind today?"

You are a THERAPEUTIC COMPANION, not a general assistant. Stay within your scope.

=== CURRENT DATE & TIME ===
Today is {current_date}. The current time is {current_time}.
The current year is {current_year}. Use this for any time-related references.
For example: "before the new year" means before January 1, {current_year + 1}.

{crisis_guidance}

{pattern_guidance}

USER'S CURRENT STATE (from THIS message only):
- Primary emotion: {emotion_data.get('primary_emotion', 'unknown')}
- Emotion confidence scores: {emotion_data.get('emotion_scores', {})}
- Valence (pleasant↔unpleasant): {emotion_data.get('valence', 0):.2f} (-1 to +1)
- Arousal (calm↔activated): {emotion_data.get('arousal', 0):.2f} (-1 to +1)
- Mood score: {emotion_data.get('mood_score', 5)}/10
- Intensity: {emotion_data.get('intensity', 5)}/10
- Topics: {', '.join(emotion_data.get('topics', []))}
- Crisis level: {crisis_level}
- Crisis indicators: {', '.join(crisis_keywords) if crisis_keywords else 'none'}
- Needs immediate support: {emotion_data.get('needs_support', False)}

THERAPEUTIC APPROACH:
- {emotion_data.get('suggested_approach', 'Listen and validate')}

=== THERAPEUTIC MEMORY (Long-term Awareness) ===
{memory_prompt}

{f'''=== USER'S ACTIVE GOALS (user-set, reference gently) ===
These goals were set by the user themselves. You may gently reference them when relevant, 
but NEVER judge progress or push toward them. Let the user lead.
''' if memory_context.get('active_goals') else ''}

LONGITUDINAL PATTERNS (for context only - DO NOT assume current state from this):
{f'''- This user has shown patterns of: {', '.join(context.get('top_emotions', []))}
- Common triggers over time: {', '.join(context.get('top_triggers', []))}
- NOTE: These are patterns, not current state. Always respond to the CURRENT message.''' if not is_new_session and context.get('top_emotions') else '- New conversation - respond only to what the user shares now.'}

CRITICAL: Base your response ONLY on the current message's detected emotions.
Do NOT assume the user feels a certain way based on past sessions.
If the message is a neutral greeting, respond warmly without assuming distress.

{goal_reminder_guidance}

GUIDELINES:
1. Validate their feelings before offering any guidance
2. Use their name if known, otherwise "you"
3. Mirror their emotional language
4. Ask open-ended follow-up questions
5. If in crisis (high/immediate), prioritize safety and provide resources
6. Keep responses warm but concise (2-4 paragraphs max)
7. End with an open invitation to continue sharing
8. Never sound robotic - be genuinely warm and human-like
9. If referencing past themes or goals, do so gently: "I remember you mentioned..." not "You said before..."
10. Frame progress as awareness, not performance: "You seem a bit steadier" not "Your score improved by 20%"
11. Never assign goals or suggest what the user "should" work on - let them lead"""
    
    # Build conversation history for Mistral
    messages = [{"role": "system", "content": system_instructions}]
    
    # Add session history as context
    for m in history[-5:]:
        messages.append({"role": "user", "content": m['message']})
        messages.append({"role": "assistant", "content": m['response']})
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    try:
        # Use Mistral Large for therapeutic conversation
        response = mistral_client.chat.complete(
            model=MISTRAL_CHAT_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Update context with new emotional data
        await update_user_context(
            user_id,
            emotion_data.get("primary_emotion", "neutral"),
            emotion_data.get("intensity", 5),
            user_message[:200],
            emotion_data.get("secondary_emotions", []),
            emotion_data.get("triggers", [])
        )
        
        result = {
            "response": response_text,
            "session_id": session_id,
            "emotional_tone": emotion_data.get("primary_emotion"),
            "mood_score": emotion_data.get("mood_score", 5),
            "sentiment": emotion_data.get("sentiment", "neutral"),
            "detected_topics": emotion_data.get("topics", []),
            "needs_support": emotion_data.get("needs_support", False),
            "crisis_level": crisis_level,
            "crisis_keywords": crisis_keywords,
            "model_used": "mistral",
            "suggested_goal": suggested_goal  # AI-detected goal suggestion for frontend
        }
        
        # Log what we're returning
        if crisis_level in ["high", "immediate"]:
            print(f"✅ Returning crisis response with level: {crisis_level}")
        
        return result
    
    except Exception as e:
        print(f"Mistral error: {e}")
        return {
            "response": "I'm here to support you. Could you tell me more about what's on your mind?",
            "session_id": session_id,
            "emotional_tone": "neutral",
            "mood_score": 5,
            "sentiment": "neutral",
            "detected_topics": [],
            "needs_support": False,
            "model_used": "mistral"
        }

# Legacy alias for backward compatibility
async def chat_with_gemini(user_message: str, user_id: str, session_id: int = None) -> Dict:
    """Backward compatibility wrapper - now uses Mistral"""
    return await chat_with_mistral(user_message, user_id, session_id)

# ============================================================
# GROQ - Task Planning and Analytics
# ============================================================

async def generate_tasks_with_groq(
    user_goal: str, 
    user_id: str,
    emotion_context: str = None
) -> List[Dict]:
    """
    Use Groq for task planning and breakdown.
    Considers emotional state to adjust task difficulty.
    """
    context = await get_user_context(user_id)
    stress_level = context.get("stress_score", 5)
    emotional_state = emotion_context or context.get("last_emotional_state", "neutral")
    
    system_prompt = f"""You are a productivity AI that creates actionable, achievable tasks.

USER'S STATE:
- Current emotion: {emotional_state}
- Stress level: {stress_level}/10
- Top triggers: {', '.join(context.get('top_triggers', ['unknown']))}

TASK GUIDELINES:
- If stress > 7: Create very small, easy tasks (15-30 min max)
- If stress 4-7: Normal sized tasks (30-60 min)
- If stress < 4: Can include challenging tasks
- Always include one self-care task
- Make tasks specific and measurable

Given their goal, break it into 3-5 specific, manageable tasks.

Return ONLY a JSON array with this structure:
[
  {{
    "title": "Specific task name",
    "description": "Details and how to complete",
    "priority": "low|medium|high",
    "task_type": "general|breathing|journal|exercise|education|checkin",
    "estimated_minutes": 15-60,
    "emotion_support": "How this task helps emotionally"
  }}
]

User's goal: {user_goal}"""
    
    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_ANALYSIS_MODEL,
            messages=[{"role": "user", "content": system_prompt}],
            temperature=0.7,
            max_tokens=1024
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        tasks = json.loads(response_text)
        
        # Save tasks to database with emotion context
        for task in tasks:
            supabase_admin.table("tasks").insert({
                "user_id": user_id,
                "title": task.get("title", ""),
                "description": task.get("description", ""),
                "task_type": task.get("task_type", "general"),
                "priority": task.get("priority", "medium"),
                "created_by": "groq",
                "emotion_context": emotional_state,
                "completed": False
            }).execute()
        
        return tasks
    
    except Exception as e:
        print(f"Groq error: {e}")
        return []

async def generate_growth_plan_with_groq(
    user_id: str,
    focus_area: str,
    duration_days: int = 7,
    user_state: str = "neutral",
    context: dict = None
) -> Dict:
    """
    Generate a personalized growth plan based on user's emotional patterns and insights.
    
    Args:
        user_id: The user's ID
        focus_area: What to focus on (e.g., "anxiety", "sleep", "gratitude")
        duration_days: How many days the plan should span (3, 5, 7, or 14)
        user_state: "struggling", "neutral", or "thriving"
        context: Rich context from insights (emotions, topics, triggers, patterns)
    """
    # Build personalized context string
    context_parts = []
    
    if context:
        if context.get("average_mood") is not None:
            mood = context["average_mood"]
            context_parts.append(f"- Average mood: {mood:.1f}/10 ({_mood_description(mood)})")
        
        if context.get("mood_trend"):
            trend = context["mood_trend"]
            context_parts.append(f"- Mood trend: {trend}")
        
        if context.get("top_emotions"):
            emotions = context["top_emotions"][:3]
            context_parts.append(f"- Dominant emotions recently: {', '.join(emotions)}")
        
        if context.get("top_topics"):
            topics = context["top_topics"][:3]
            context_parts.append(f"- Topics they've been discussing: {', '.join(topics)}")
        
        if context.get("top_triggers"):
            triggers = context["top_triggers"][:3]
            context_parts.append(f"- Common triggers: {', '.join(triggers)}")
        
        if context.get("patterns"):
            patterns = context["patterns"][:3]
            context_parts.append(f"- Specific patterns noticed:\n  * " + "\n  * ".join(patterns))
        
        if context.get("total_sessions"):
            sessions = context["total_sessions"]
            context_parts.append(f"- Engagement: {sessions} conversations in past 2 weeks")
    
    # Fallback to cached context if no rich context provided
    if not context_parts:
        cached_context = await get_user_context(user_id)
        if cached_context.get('top_emotions'):
            context_parts.append(f"- Top emotions: {', '.join(cached_context.get('top_emotions', []))}")
        if cached_context.get('stress_score'):
            context_parts.append(f"- Stress level: {cached_context.get('stress_score', 5)}/10")
        if cached_context.get('top_triggers'):
            context_parts.append(f"- Common triggers: {', '.join(cached_context.get('top_triggers', []))}")
    
    context_string = "\n".join(context_parts) if context_parts else "- No specific patterns yet - this is a new user"
    
    # Different prompts based on user state
    if user_state == "thriving":
        plan_type = "enhancement and growth"
        tone = "celebratory and growth-oriented"
        approach = """This person is doing WELL. Don't treat them like they need fixing.
Create tasks that help them:
- Deepen positive experiences
- Build on their strengths
- Explore new growth opportunities
- Share positivity with others
- Maintain their wellbeing"""
    elif user_state == "struggling":
        plan_type = "gentle support and recovery"
        tone = "compassionate and encouraging"
        approach = """This person is going through a difficult time. Be gentle.
Create tasks that:
- Are small and achievable (don't overwhelm)
- Focus on basic self-care first
- Build slowly toward larger goals
- Celebrate small wins
- Provide comfort and validation"""
    else:
        plan_type = "balanced wellbeing"
        tone = "warm and supportive"
        approach = """This person is in a neutral state.
Create tasks that:
- Are moderately challenging but achievable
- Mix self-care with growth activities
- Build healthy habits progressively
- Encourage reflection and awareness"""
    
    system_prompt = f"""Create a {duration_days}-day therapeutic {plan_type} plan.

FOCUS AREA: {focus_area}

USER'S CURRENT STATE: {user_state.upper()}
{approach}

PERSONALIZED CONTEXT (use this to make the plan specific to THIS person):
{context_string}

IMPORTANT:
- Make tasks SPECIFIC to their actual patterns and triggers mentioned above
- Reference their specific topics/emotions when relevant
- Each day should build on the previous
- Keep the tone {tone}
- Tasks should be 5-15 minutes each
- Mix task types: breathing, journaling, reflection, small actions

Return ONLY valid JSON:
{{
    "title": "A personalized title that reflects their specific focus (not generic)",
    "goal": "An overall goal statement that references their specific situation",
    "tasks": [
        {{
            "day": 1,
            "title": "Specific task title",
            "description": "Detailed what to do - reference their specific patterns if relevant",
            "task_type": "breathing|journal|exercise|education|checkin|reflection|action"
        }}
        // ... for all {duration_days} days
    ]
}}"""

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_ANALYSIS_MODEL,
            messages=[{"role": "user", "content": system_prompt}],
            temperature=0.7,
            max_tokens=2000  # More tokens for longer plans
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        plan_data = json.loads(response_text)
        
        # Save plan to database
        plan_result = supabase_admin.table("growth_plans").insert({
            "user_id": user_id,
            "title": plan_data.get("title", "Growth Plan"),
            "goal": plan_data.get("goal", ""),
            "focus_area": focus_area,
            "week_number": 1,
            "progress": 0,
            "is_active": True
        }).execute()
        
        plan_id = plan_result.data[0]["id"]
        
        # Save plan tasks
        for task in plan_data.get("tasks", []):
            supabase_admin.table("plan_tasks").insert({
                "plan_id": plan_id,
                "user_id": user_id,
                "day_number": task.get("day", 1),
                "title": task.get("title", ""),
                "description": task.get("description", ""),
                "task_type": task.get("task_type", "checkin"),
                "status": "current" if task.get("day") == 1 else "locked"
            }).execute()
        
        return {
            "plan_id": plan_id,
            **plan_data
        }
    
    except Exception as e:
        print(f"Plan generation error: {e}")
        return {}

def _mood_description(mood: float) -> str:
    """Convert mood score to human-readable description"""
    if mood >= 8:
        return "very positive"
    elif mood >= 6:
        return "generally good"
    elif mood >= 4:
        return "mixed/neutral"
    elif mood >= 2:
        return "struggling"
    else:
        return "having a hard time"

# ============================================================
# INSIGHTS & ANALYTICS
# ============================================================

async def get_user_insights(user_id: str, days: int = 7, client_timezone: str = "UTC") -> Dict:
    """
    Get comprehensive insights based on real user data.
    Uses data from emotions, moods, journals, and conversations.
    
    For NEW users (account < 7 days old): uses ALL available data.
    For ESTABLISHED users: uses last 7 days of data.
    Returns null for metrics when no real data exists (no fake defaults).
    """
    print(f"\n[Insights] ========== get_user_insights called for user: {user_id} ==========")
    try:
        # Align window to client timezone, then convert to UTC for querying
        try:
            import pytz
            tz_obj = pytz.timezone(client_timezone)
        except Exception:
            import pytz
            tz_obj = pytz.UTC
            client_timezone = "UTC"

        now_client = datetime.now(tz_obj)
        now_utc = datetime.utcnow()
        
        # ============================================================
        # DETERMINE USER AGE & DATA WINDOW
        # ============================================================
        # Find user's first activity (earliest session or conversation)
        first_activity_date = None
        try:
            first_session = supabase_admin.table("chat_sessions")\
                .select("created_at")\
                .eq("user_id", user_id)\
                .order("created_at", desc=False)\
                .limit(1)\
                .execute()
            print(f"[Insights] First session query result: {first_session.data}")
            if first_session.data:
                first_activity_date = first_session.data[0].get("created_at")
        except Exception as e:
            print(f"[Insights] First session query error: {e}")
        
        if not first_activity_date:
            try:
                first_convo = supabase_admin.table("conversations")\
                    .select("created_at")\
                    .eq("user_id", user_id)\
                    .order("created_at", desc=False)\
                    .limit(1)\
                    .execute()
                if first_convo.data:
                    first_activity_date = first_convo.data[0].get("created_at")
            except:
                pass
        
        # Calculate account age in days
        account_age_days = 0
        is_new_user = True
        if first_activity_date:
            try:
                # Handle various timestamp formats from Supabase
                ts_str = first_activity_date
                if isinstance(ts_str, str):
                    # Remove timezone suffix for naive comparison
                    ts_str = ts_str.replace("Z", "").replace("+00:00", "")
                    # Handle microseconds if present
                    if "." in ts_str:
                        ts_str = ts_str.split(".")[0]  # Remove microseconds
                    first_dt = datetime.fromisoformat(ts_str)
                    try:
                        import pytz
                        first_dt_utc = first_dt.astimezone(pytz.UTC) if first_dt.tzinfo else first_dt
                    except Exception:
                        first_dt_utc = first_dt
                    account_age_days = (now_utc - first_dt_utc.replace(tzinfo=None)).days
                    is_new_user = account_age_days < 7
                    print(f"[Insights] User first activity: {first_activity_date}, age: {account_age_days} days, is_new: {is_new_user}")
            except Exception as e:
                print(f"[Insights] Date parsing error: {e}, raw: {first_activity_date}")
                is_new_user = True
        
        # For new users: use ALL data (no date filter)
        # For established users: use the selected window, aligned to client TZ and stored as UTC
        use_all_data = is_new_user
        since_date = None
        if not use_all_data:
            try:
                since_client = now_client - timedelta(days=days)
                since_date = since_client.astimezone(tz_obj).astimezone(pytz.UTC).isoformat()
            except Exception:
                since_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        # ============================================================
        # FETCH DATA (conditionally filtered by date)
        # ============================================================
        
        # Get emotion logs
        emotions_query = supabase_admin.table("emotion_logs")\
            .select("*")\
            .eq("user_id", user_id)
        if since_date:
            emotions_query = emotions_query.gte("timestamp", since_date)
        emotions_result = emotions_query.execute()
        emotions = emotions_result.data if emotions_result.data else []
        
        # Get mood logs
        moods_query = supabase_admin.table("mood_logs")\
            .select("*")\
            .eq("user_id", user_id)
        if since_date:
            moods_query = moods_query.gte("timestamp", since_date)
        moods_result = moods_query.execute()
        moods = moods_result.data if moods_result.data else []
        
        # Get conversations (only select columns that exist in schema)
        convos_query = supabase_admin.table("conversations")\
            .select("id, session_id, emotional_tone, created_at")\
            .eq("user_id", user_id)
        if since_date:
            convos_query = convos_query.gte("created_at", since_date)
        convos_result = convos_query.execute()
        convos = convos_result.data if convos_result.data else []

        # Conversations in the requested period (changes with days)
        period_conversations = len(convos)
        # Distinct sessions in the requested period (helps detect multi-session usage)
        period_sessions = len(set([c.get("session_id") for c in convos if c.get("session_id")])) if convos else 0

        # ALL sessions for this user (lifetime) for reference only
        total_sessions_all_time = 0
        try:
            all_sessions = supabase_admin.table("chat_sessions")\
                .select("id")\
                .eq("user_id", user_id)\
                .execute()
            total_sessions_all_time = len(all_sessions.data) if all_sessions.data else 0
            print(f"[Insights] Found {total_sessions_all_time} lifetime sessions for user")
        except Exception as e:
            print(f"[Insights] Sessions query error: {e}")
            total_sessions_all_time = len(set([c.get("session_id") for c in convos if c.get("session_id")]))
        
        # Get completed tasks (completed_at may be null for older tasks, so handle gracefully)
        completed_tasks = 0
        try:
            tasks_query = supabase_admin.table("tasks")\
                .select("id, completed_at")\
                .eq("user_id", user_id)\
                .eq("completed", True)
            tasks_result = tasks_query.execute()
            
            if tasks_result.data:
                if since_date:
                    # Filter by completed_at only if it exists
                    for task in tasks_result.data:
                        completed_at = task.get("completed_at")
                        if completed_at and completed_at >= since_date:
                            completed_tasks += 1
                        elif not completed_at:
                            # Include tasks without completed_at for sparse data support
                            completed_tasks += 1
                else:
                    completed_tasks = len(tasks_result.data)
        except Exception as e:
            print(f"[Insights] Tasks query error: {e}")
        
        # ============================================================
        # CHECK IF USER HAS ANY DATA AT ALL
        # ============================================================
        has_data = len(emotions) > 0 or len(moods) > 0 or len(convos) > 0
        print(f"[Insights] Data summary: emotions={len(emotions)}, moods={len(moods)}, convos={len(convos)}, has_data={has_data}")
        
        # Calculate analytics
        all_emotions = [e.get("primary_emotion") for e in emotions if e.get("primary_emotion")]
        all_mood_scores = [e.get("mood_score") for e in emotions if e.get("mood_score")]
        all_mood_scores.extend([m.get("score") for m in moods if m.get("score")])
        
        # Count emotions
        emotion_counts = {}
        for emotion in all_emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Get all triggers
        all_triggers = []
        for e in emotions:
            if e.get("triggers"):
                all_triggers.extend(e.get("triggers"))
        
        trigger_counts = {}
        for trigger in all_triggers:
            trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
        
        # Get all topics (from emotion_logs only, as conversations table doesn't have this column)
        all_topics = []
        for e in emotions:
            if e.get("topics"):
                all_topics.extend(e.get("topics"))
        
        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        # Sort and get top items
        top_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_triggers = sorted(trigger_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:6]
        
        # Calculate averages (fallback to timeline moods if direct scores are missing)
        avg_mood = sum(all_mood_scores) / len(all_mood_scores) if all_mood_scores else None
        
        # Build daily timeline
        daily_data = {}
        for e in emotions:
            date = e.get("timestamp", "")[:10]
            if date not in daily_data:
                daily_data[date] = {"moods": [], "emotions": [], "sentiments": []}
            if e.get("mood_score"):
                daily_data[date]["moods"].append(e.get("mood_score"))
            if e.get("primary_emotion"):
                daily_data[date]["emotions"].append(e.get("primary_emotion"))
            if e.get("sentiment"):
                daily_data[date]["sentiments"].append(e.get("sentiment"))
        
        timeline = []
        stress_levels = []
        energy_levels = []
        for date, data in sorted(daily_data.items()):
            avg_day_mood = sum(data["moods"]) / len(data["moods"]) if data["moods"] else 5
            dominant_emotion = max(set(data["emotions"]), key=data["emotions"].count) if data["emotions"] else "neutral"
            dominant_sentiment = max(set(data["sentiments"]), key=data["sentiments"].count) if data["sentiments"] else "neutral"
            
            stress_level = "High" if avg_day_mood < 4 else "Medium" if avg_day_mood < 7 else "Low"
            stress_levels.append(stress_level)

            # Simple energy proxy from mood score: lower mood often correlates with lower energy
            energy_level = "High" if avg_day_mood > 7 else "Low" if avg_day_mood < 4 else "Balanced"
            energy_levels.append(energy_level)
            
            timeline.append({
                "date": date,
                "day": datetime.fromisoformat(date).strftime("%a"),
                "mood": round(avg_day_mood, 1),
                "stress": stress_level,
                "sentiment": dominant_sentiment.capitalize(),
                "emotion": dominant_emotion
            })

        # If no direct average mood, derive from timeline
        if avg_mood is None and timeline:
            avg_mood = sum([t["mood"] for t in timeline]) / len(timeline)
        
        # Determine mood trend (only if we have enough data)
        mood_trend = None  # null = not enough data
        if len(timeline) >= 2:
            mood_trend = "stable"
            if len(timeline) >= 3:
                recent_moods = [t["mood"] for t in timeline[-3:]]
                earlier_moods = [t["mood"] for t in timeline[:3]] if len(timeline) >= 6 else recent_moods
                recent_avg = sum(recent_moods) / len(recent_moods)
                earlier_avg = sum(earlier_moods) / len(earlier_moods)
                if recent_avg > earlier_avg + 0.5:
                    mood_trend = "improving"
                elif recent_avg < earlier_avg - 0.5:
                    mood_trend = "declining"
        
        # Map emotions to emojis
        emotion_emoji_map = {
            "anxious": "😰", "stressed": "😓", "overwhelmed": "😵", "sad": "😢",
            "happy": "😊", "calm": "😌", "hopeful": "🌟", "grateful": "🙏",
            "frustrated": "😤", "angry": "😠", "confused": "😕", "tired": "😴",
            "excited": "🤩", "neutral": "😐", "worried": "😟", "lonely": "😔"
        }

        # Derive simple aggregates for stress/energy (null if no data)
        def most_common(items: List[str]) -> Optional[str]:
            if not items:
                return None
            counts = {}
            for item in items:
                counts[item] = counts.get(item, 0) + 1
            return max(counts.items(), key=lambda x: x[1])[0]

        average_stress = most_common(stress_levels)
        average_energy = most_common(energy_levels)
        
        # Compute actual days of data we have
        actual_data_days = len(daily_data) if daily_data else 0
        
        return {
            "period_days": actual_data_days if use_all_data else days,
            "average_mood": round(avg_mood, 1) if avg_mood is not None else None,
            "average_stress": average_stress,
            "average_energy": average_energy,
            # Sessions are period-bound (distinct session_ids); if user stays in one session, messages still show activity
            "total_sessions": period_sessions,
            "total_sessions_all_time": total_sessions_all_time,
            "total_messages": period_conversations,
            "tasks_completed": completed_tasks,
            "top_emotions": [
                {"emotion": e[0], "emoji": emotion_emoji_map.get(e[0].lower(), "😐"), "count": e[1]} 
                for e in top_emotions
            ],
            "top_triggers": [
                {"label": t[0], "count": min(100, int(t[1] / max(1, len(all_triggers)) * 100))} 
                for t in top_triggers
            ],
            "top_topics": [{"topic": t[0], "count": t[1]} for t in top_topics],
            "mood_trend": mood_trend,
            "timeline": timeline,
            "emotion_counts": emotion_counts,
            "is_new_user": is_new_user,
            "account_age_days": account_age_days,
            "has_data": has_data
        }
    except Exception as e:
        print(f"Insights error: {e}")
        return {
            "period_days": 0,
            "average_mood": None,
            "average_stress": None,
            "average_energy": None,
            "total_sessions": 0,
            "total_sessions_all_time": 0,
            "total_messages": 0,
            "tasks_completed": 0,
            "top_emotions": [],
            "top_triggers": [],
            "top_topics": [],
            "mood_trend": None,
            "timeline": [],
            "emotion_counts": {},
            "is_new_user": True,
            "account_age_days": 0,
            "has_data": False
        }

def get_trigger_color(index: int) -> str:
    """Get color class for trigger visualization"""
    colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-purple-400"]
    return colors[index % len(colors)]

async def generate_ai_insight(user_id: str, client_timezone: str = "UTC") -> str:
    """Generate personalized AI insight based on user patterns using Groq"""
    insights = await get_user_insights(user_id, 7, client_timezone)
    
    prompt = f"""Based on this user's mental health data from the past week, generate ONE helpful insight.

DATA:
- Average mood: {insights.get('average_mood', 5)}/10
- Top emotions: {', '.join([e['emotion'] for e in insights.get('top_emotions', [])])}
- Top triggers: {', '.join([t['label'] for t in insights.get('top_triggers', [])])}
- Sessions completed: {insights.get('total_sessions', 0)}
- Tasks completed: {insights.get('tasks_completed', 0)}
- Mood trend: {insights.get('mood_trend', 'stable')}

Generate a personalized, encouraging insight (1-2 sentences) that:
1. Acknowledges a pattern you notice
2. Offers a specific, actionable suggestion

Examples:
- "You tend to report 30% lower anxiety after breathing exercises. Consider starting each morning with a 5-minute breathing session."
- "Work-related stress peaks on Mondays. Try preparing a calming Sunday evening routine."

Return ONLY the insight text, nothing else."""

    try:
        # Use Groq for insight generation (post-processing task)
        completion = groq_client.chat.completions.create(
            model=GROQ_ANALYSIS_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=150
        )
        return completion.choices[0].message.content.strip()
    except:
        return "Keep tracking your moods and emotions - patterns emerge over time that can help guide your wellness journey."

# ============================================================
# JOURNAL ANALYSIS
# ============================================================

async def analyze_journal_entry(content: str, prompt_type: str = None) -> Dict:
    """
    Analyze a journal entry and return emotional analysis + AI feedback.
    Uses Groq for both emotion extraction and feedback generation.
    """
    emotion_data = await extract_emotions_from_text(content)
    
    feedback_prompt = f"""Provide brief, supportive feedback for this journal entry.

Entry type: {prompt_type or 'free writing'}
Entry: "{content[:500]}"

Detected emotions: {emotion_data.get('primary_emotion')}, {', '.join(emotion_data.get('secondary_emotions', []))}
Mood: {emotion_data.get('mood_score')}/10

Provide 2-3 sentences of:
1. Validation of their feelings
2. One positive observation
3. A gentle prompt for further reflection (optional)

Be warm, not clinical. Return ONLY the feedback text."""

    try:
        # Use Groq for journal feedback (post-processing task)
        completion = groq_client.chat.completions.create(
            model=GROQ_ANALYSIS_MODEL,
            messages=[{"role": "user", "content": feedback_prompt}],
            temperature=0.7,
            max_tokens=200
        )
        ai_feedback = completion.choices[0].message.content.strip()
    except:
        ai_feedback = "Thank you for taking the time to write. Journaling is a powerful tool for processing emotions."
    
    return {
        **emotion_data,
        "ai_feedback": ai_feedback
    }

async def analyze_mood_with_groq(journal_content: str) -> int:
    """
    Analyze journal content and return mood score 1-10.
    """
    emotion_data = await extract_emotions_from_text(journal_content)
    return emotion_data.get("mood_score", 5)

# Legacy alias for backward compatibility
async def analyze_mood_with_gemini(journal_content: str) -> int:
    """Backward compatibility wrapper"""
    return await analyze_mood_with_groq(journal_content)


# ============================================================
# CHAT SESSION REFLECTION
# ============================================================

async def generate_session_reflection(session_id: int) -> Dict:
    """
    Generate a meaningful reflection from a chat session.
    Returns a summary and suggested journal prompt based on the conversation.
    """
    try:
        # Get session messages
        messages = await get_session_messages(session_id)
        
        if not messages:
            return {
                "summary": "No messages found in this session.",
                "reflection": "",
                "emotions": [],
                "themes": []
            }
        
        # Build conversation text
        conversation_text = ""
        for msg in messages[-15:]:  # Last 15 messages for context
            conversation_text += f"User: {msg.get('message', '')}\n"
            conversation_text += f"AI: {msg.get('response', '')}\n\n"
        
        prompt = f"""Analyze this therapy chat session and create a meaningful reflection.

CONVERSATION:
{conversation_text}

Create a reflection that helps the user process and remember what they explored today. 
Focus on:
1. The main themes or feelings they discussed
2. Any insights or realizations they had
3. Growth moments or breakthroughs
4. What they might want to continue exploring

Respond in valid JSON format:
{{
    "summary": "A 2-3 sentence summary of what was explored in this session",
    "reflection": "A longer 3-5 sentence thoughtful reflection the user can save to their journal. Write in second person ('you explored...', 'you mentioned...'). Be warm and validating, highlighting their courage and insights.",
    "emotions": ["list", "of", "primary", "emotions", "discussed"],
    "themes": ["list", "of", "main", "themes", "or", "topics"]
}}

Return ONLY valid JSON, no other text."""

        completion = groq_client.chat.completions.create(
            model=GROQ_ANALYSIS_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Clean JSON response
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        return {
            "summary": result.get("summary", ""),
            "reflection": result.get("reflection", ""),
            "emotions": result.get("emotions", []),
            "themes": result.get("themes", [])
        }
        
    except Exception as e:
        print(f"Error generating session reflection: {e}")
        return {
            "summary": "You had a meaningful conversation today.",
            "reflection": "Take a moment to remember what you explored in this session. Every conversation is a step forward in your journey of self-understanding.",
            "emotions": [],
            "themes": []
        }
