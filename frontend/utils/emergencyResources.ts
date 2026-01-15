export type CrisisAction = {
  label: string;
  href: string;
  kind: 'call' | 'text' | 'web';
};

export type CrisisResource = {
  name: string;
  description: string;
  availability?: string;
  actions: CrisisAction[];
  note?: string;
};

export type RegionResources = {
  regionCode: string;
  label: string;
  emergencyNumber?: string;
  resources: CrisisResource[];
};

// Core dataset of crisis resources by ISO country code.
// Keep the list small, authoritative, and easy to extend.
export const REGION_RESOURCES: Record<string, RegionResources> = {
  LK: {
    regionCode: 'LK',
    label: 'Sri Lanka',
    emergencyNumber: '119',
    resources: [
      {
        name: 'National Mental Health Helpline (1926)',
        description: '24/7 government mental health support line',
        availability: '24/7',
        actions: [{ label: 'Call 1926', href: 'tel:1926', kind: 'call' }]
      },
      {
        name: 'Sumithrayo',
        description: 'Suicide prevention and emotional support',
        availability: 'Daily 9am–8pm',
        actions: [{ label: 'Call 011-269-6666', href: 'tel:+94112696666', kind: 'call' }]
      }
    ]
  },
  US: {
    regionCode: 'US',
    label: 'United States',
    emergencyNumber: '911',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        description: 'Free, confidential support for people in distress',
        availability: '24/7',
        actions: [
          { label: 'Call 988', href: 'tel:988', kind: 'call' },
          { label: 'Text 988', href: 'sms:988', kind: 'text' }
        ]
      },
      {
        name: 'Crisis Text Line',
        description: 'Text-based support from trained crisis counselors',
        availability: '24/7',
        actions: [{ label: 'Text "HELLO" to 741741', href: 'sms:741741?&body=HELLO', kind: 'text' }]
      }
    ]
  },
  CA: {
    regionCode: 'CA',
    label: 'Canada',
    emergencyNumber: '911',
    resources: [
      {
        name: '988 Suicide Crisis Helpline',
        description: 'Nationwide suicide crisis support',
        availability: '24/7',
        actions: [
          { label: 'Call 988', href: 'tel:988', kind: 'call' },
          { label: 'Text 988', href: 'sms:988', kind: 'text' }
        ]
      },
      {
        name: 'Talk Suicide Canada',
        description: 'Bilingual (EN/FR) crisis support',
        availability: '24/7',
        actions: [
          { label: 'Call 1-833-456-4566', href: 'tel:1-833-456-4566', kind: 'call' },
          { label: 'Text 45645 (4pm–12am ET)', href: 'sms:45645', kind: 'text' }
        ]
      }
    ]
  },
  GB: {
    regionCode: 'GB',
    label: 'United Kingdom',
    emergencyNumber: '999',
    resources: [
      {
        name: 'Samaritans',
        description: 'Emotional support for anyone in distress',
        availability: '24/7',
        actions: [{ label: 'Call 116 123', href: 'tel:116123', kind: 'call' }]
      },
      {
        name: 'Shout',
        description: 'Crisis text support',
        availability: '24/7',
        actions: [{ label: 'Text "SHOUT" to 85258', href: 'sms:85258?&body=SHOUT', kind: 'text' }]
      }
    ]
  },
  AU: {
    regionCode: 'AU',
    label: 'Australia',
    emergencyNumber: '000',
    resources: [
      {
        name: 'Lifeline',
        description: 'Suicide prevention and crisis support',
        availability: '24/7',
        actions: [
          { label: 'Call 13 11 14', href: 'tel:131114', kind: 'call' },
          { label: 'Text 0477 13 11 14', href: 'sms:0477131114', kind: 'text' }
        ]
      },
      {
        name: 'Beyond Blue',
        description: 'Anxiety, depression, and suicide support',
        availability: '24/7',
        actions: [{ label: 'Call 1300 22 4636', href: 'tel:1300224636', kind: 'call' }]
      }
    ]
  },
  IN: {
    regionCode: 'IN',
    label: 'India',
    emergencyNumber: '112',
    resources: [
      {
        name: 'Kiran Mental Health Helpline',
        description: 'National mental health support',
        availability: '24/7',
        actions: [{ label: 'Call 1800-599-0019', href: 'tel:18005990019', kind: 'call' }]
      },
      {
        name: 'AASRA',
        description: 'Crisis intervention and suicide prevention',
        availability: '24/7',
        actions: [{ label: 'Call +91-9820466726', href: 'tel:+919820466726', kind: 'call' }]
      }
    ]
  },
  EU: {
    regionCode: 'EU',
    label: 'EU / EEA',
    emergencyNumber: '112',
    resources: [
      {
        name: 'Find A Helpline (Europe)',
        description: 'Local crisis lines across Europe',
        availability: '24/7',
        actions: [{ label: 'Browse local helplines', href: 'https://findahelpline.com/i/eea', kind: 'web' }]
      }
    ]
  },
  JP: {
    regionCode: 'JP',
    label: 'Japan',
    emergencyNumber: '119',
    resources: [
      {
        name: 'TELL Lifeline',
        description: 'English/Japanese support for mental health and suicide prevention',
        availability: 'Daily 9am–11pm',
        actions: [{ label: 'Call 03-5774-0992', href: 'tel:+81357740992', kind: 'call' }]
      },
      {
        name: 'Yorisoi Helpline',
        description: 'Free, multi-language support; press 2 for English',
        availability: '24/7',
        actions: [{ label: 'Call 0120-279-338', href: 'tel:0120279338', kind: 'call' }]
      }
    ]
  },
  GLOBAL: {
    regionCode: 'GLOBAL',
    label: 'International',
    emergencyNumber: undefined,
    resources: [
      {
        name: 'Find A Helpline (Global)',
        description: 'Crisis helplines in 30+ languages across 40+ countries',
        availability: '24/7',
        actions: [{ label: 'Visit findahelpline.com', href: 'https://findahelpline.com', kind: 'web' }]
      }
    ]
  }
};

export const REGION_OPTIONS = [
    { value: 'LK', label: REGION_RESOURCES.LK.label },
  { value: 'US', label: REGION_RESOURCES.US.label },
  { value: 'CA', label: REGION_RESOURCES.CA.label },
  { value: 'GB', label: REGION_RESOURCES.GB.label },
  { value: 'AU', label: REGION_RESOURCES.AU.label },
  { value: 'IN', label: REGION_RESOURCES.IN.label },
  { value: 'JP', label: REGION_RESOURCES.JP.label },
  { value: 'EU', label: REGION_RESOURCES.EU.label },
  { value: 'GLOBAL', label: REGION_RESOURCES.GLOBAL.label }
];

// Attempt to infer the user's region from the browser locale (e.g., "en-US" => "US").
export function getUserRegionCode(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;

  const locale = navigator.language || (navigator.languages && navigator.languages[0]);
  if (!locale) return undefined;

  const parts = locale.split('-');
  if (parts.length > 1) {
    const region = parts[parts.length - 1]?.toUpperCase();
    if (region && REGION_RESOURCES[region]) return region;
  }

  return undefined;
}

// Returns region resources with a safe GLOBAL fallback.
export function getEmergencyResources(regionCode?: string): RegionResources {
  const normalized = regionCode?.toUpperCase();
  return (normalized && REGION_RESOURCES[normalized]) || REGION_RESOURCES.GLOBAL;
}
