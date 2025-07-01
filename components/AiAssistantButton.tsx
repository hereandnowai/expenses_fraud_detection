import React from 'react';

interface AiAssistantButtonProps {
  onToggleChat: () => void;
}

const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.697-3.697c-.023.002-.047.003-.07.004H7.5a2.25 2.25 0 0 1-2.25-2.25V10.608c0-.97.616-1.813 1.5-2.097L6.75 8.511a2.25 2.25 0 0 0-2.25 2.25v4.286c0 1.243 1.007 2.25 2.25 2.25h3.975c.148 0 .293.024.434.068l2.603 2.603-.84-2.735A2.25 2.25 0 0 1 12.75 15h3.975a2.25 2.25 0 0 0 2.25-2.25V10.608c0-.62-.259-1.193-.7-1.614l-.002-.001Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5c0-.077.002-.154.005-.231c.218-.007.436-.014.654-.014c.218 0 .436.007.654.014c.003.077.005.154.005.231c0 .077-.002.154-.005.231c-.218.007-.436.014-.654.014c-.218 0-.436-.007-.654-.014A2.255 2.255 0 0 1 7.5 10.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5c0-.077.002-.154.005-.231c.218-.007.436-.014.654-.014c.218 0 .436.007.654.014c.003.077.005.154.005.231c0 .077-.002.154-.005.231c-.218.007-.436.014-.654.014c-.218 0-.436-.007-.654-.014A2.255 2.255 0 0 1 15 10.5Z" />
  </svg>
);


export const AiAssistantButton: React.FC<AiAssistantButtonProps> = ({ onToggleChat }) => {
  return (
    <button
      onClick={onToggleChat}
      className="fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-full shadow-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-transform duration-150 ease-in-out hover:scale-110 z-40"
      aria-label="Open AI Assistant Chat"
      title="Chat with AI Assistant"
    >
      <ChatBubbleIcon className="w-7 h-7" />
    </button>
  );
};