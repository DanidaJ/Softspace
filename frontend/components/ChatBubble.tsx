import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div 
      className={`flex w-full mb-5 ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
    >
      {/* Bot avatar */}
      {isBot && (
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 mr-3 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <img
            src={`${import.meta.env.BASE_URL}icons/icon.png`}
            alt="Softspace"
            className="w-7 h-7 object-contain"
            draggable={false}
          />
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-midnight-bg" />
        </div>
      )}
      
      {/* Message bubble */}
      <div
        className={`
          max-w-[85%] md:max-w-[70%] 
          px-4 py-3.5 
          rounded-2xl 
          relative
          transition-all duration-150
          ${isBot 
            ? `
              bg-midnight-surface 
              text-midnight-text 
              rounded-tl-md 
              border border-midnight-border
              shadow-sm
            ` 
            : `
              bg-gradient-to-br from-blue-500 to-blue-600
              text-white 
              rounded-tr-md 
              shadow-lg shadow-blue-500/20
            `
          }
        `}
      >
        {/* Message text */}
        <p className="leading-relaxed text-[15px] whitespace-pre-wrap">
          {message.text}
        </p>
        
        {/* Timestamp */}
        <span 
          className={`
            text-[11px] mt-2 block 
            ${isBot ? 'text-midnight-muted' : 'text-white/70'}
          `}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      
      {/* User avatar - optional, adds symmetry */}
      {!isBot && (
        <div className="w-9 h-9 rounded-xl bg-midnight-surface border border-midnight-border flex-shrink-0 ml-3 flex items-center justify-center">
          <svg className="w-5 h-5 text-midnight-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
};