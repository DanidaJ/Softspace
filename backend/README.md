# Softspace Backend

FastAPI backend with Supabase PostgreSQL + AI integration (Gemini & Groq).

## Setup

### 1. Database Setup
1. Go to [Supabase](https://supabase.com) and create a project
2. In your Supabase dashboard → SQL Editor
3. Copy and paste the contents of `database_schema.sql`
4. Click "Run" to create all tables and policies

### 2. Get API Keys

**Supabase:**
- Dashboard → Settings → API
- Copy `URL` and `anon/public` key

**Gemini API (Free):**
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create API key

**Groq API (Free):**
- [Groq Console](https://console.groq.com)
- Create API key

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file in the `backend` directory:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 5. Run the Server

```bash
python run.py
```

Server will start at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## Authentication

All endpoints require `Authorization: Bearer <token>` header with Supabase JWT token.
Users authenticate via Supabase Auth on the frontend.

## API Endpoints

### Mood Tracking
- `POST /mood/log` - Log mood entry (score 1-10, optional triggers/notes)
- `GET /mood/history` - Get mood history (default 30 days)
- `GET /mood/trends` - Get mood trends and analytics

### Journal
- `POST /journal/` - Create journal entry (AI auto-analyzes mood if not provided)
- `GET /journal/` - Get journal entries
- `GET /journal/{id}` - Get specific entry

### Tasks
- `POST /tasks/` - Create task manually
- `GET /tasks/` - Get tasks (filter: completed=true/false)
- `PATCH /tasks/{id}/complete` - Mark task complete
- `DELETE /tasks/{id}` - Delete task

### Chat & AI
- `POST /chat/` - Chat with Gemini AI (empathetic therapy conversations)
- `POST /chat/generate-tasks` - Use Groq to break down goals into tasks
- `GET /chat/history` - Get conversation history
- `GET /chat/context` - Get user's emotional context (shared AI state)

## AI Architecture

**Gemini Flash** → Emotional support, therapy, mood analysis from journals
**Groq Mixtral** → Task planning, goal breakdown, productivity
**PostgreSQL** → Shared cognitive state (emotional context, stress scores)

## VPS Deployment

1. Install Python 3.10+
2. Clone repo and set up `.env`
3. Install dependencies: `pip install -r requirements.txt`
4. Run with gunicorn:
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
5. Use nginx as reverse proxy
6. Set up SSL with certbot/Let's Encrypt

### Tasks
- `POST /tasks/` - Create task
- `GET /tasks/` - Get tasks (filter by completed)
- `PATCH /tasks/{task_id}/complete` - Mark task complete
- `DELETE /tasks/{task_id}` - Delete task

### Journal
- `POST /journal/` - Create journal entry
- `GET /journal/` - Get journal entries
- `GET /journal/{journal_id}` - Get specific entry

### Chat
- `POST /chat/` - Send message (AI integration pending)
- `GET /chat/history` - Get conversation history
- `GET /chat/context` - Get shared AI context

## Database Schema

Tables:
- `mood_logs` - User mood tracking
- `conversations` - Chat history with AI
- `tasks` - User tasks and reminders
- `journals` - Journal entries
- `context_cache` - Shared state between AI models

All tables have Row Level Security (RLS) enabled.

## Next Steps

1. Integrate Gemini API for therapy conversations
2. Integrate Groq API for task planning
3. Add AI routing logic in `/chat` endpoint
4. Implement context cache updates
