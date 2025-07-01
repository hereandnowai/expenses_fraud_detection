import React from 'react';
import { ChatMessage } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
  </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75L14.25 12l1.5-1.75L17 8.5l1.25 1.75L19.75 12l-1.5 1.75z" />
  </svg>
);

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isError = message.error === true;

  const bubbleClasses = isUser 
    ? "bg-sky-500 text-white" // Brighter blue for user
    : isError 
      ? "bg-red-500 text-white" // Brighter red for AI error
      : "bg-lime-400 text-gray-900"; // Bright lime for AI normal
  
  const alignmentClasses = isUser ? "justify-end" : "justify-start";
  // Icon colors can remain or be adjusted if needed, current ones are generic enough.
  const iconClasses = isUser ? "text-sky-600" : "text-lime-700";


  return (
    <div className={`flex items-end space-x-2 ${alignmentClasses}`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isError ? 'bg-red-600' : 'bg-lime-500'}`}>
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
      )}
      <div 
        className={`p-3 rounded-lg max-w-[70%] shadow-sm ${bubbleClasses}`}
        role={isUser ? undefined : "log"} // AI messages are part of a log
        aria-live={isUser ? undefined : "polite"} // AI messages announced
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-sky-100' : isError ? 'text-red-100' : 'text-gray-700'} ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <UserIcon className={`w-5 h-5 ${iconClasses}`} />
        </div>
      )}
    </div>
  );
};
