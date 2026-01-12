import { Message } from './types';

export const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: "Hello there! I'm here to support you. How are you feeling today?",
    sender: 'bot',
    timestamp: new Date(Date.now() - 60000),
  },
];