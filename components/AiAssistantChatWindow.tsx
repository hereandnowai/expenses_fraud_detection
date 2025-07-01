import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToAssistant } from '../services/geminiService';
import { ChatMessageItem } from './ChatMessageItem';

interface AiAssistantChatWindowProps {
  onClose: () => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
  </svg>
);

export const AiAssistantChatWindow: React.FC<AiAssistantChatWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition to handle vendor prefixes

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;
      recognition.continuous = false; // Process single utterances
      recognition.interimResults = true; // Get interim results as user speaks
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'no-speech') {
          setSpeechError("No speech was detected. Please try again.");
        } else if (event.error === 'audio-capture') {
          setSpeechError("Audio capture failed. Ensure your microphone is working.");
        } else if (event.error === 'not-allowed') {
          setSpeechError("Microphone access denied. Please enable microphone permissions in your browser settings.");
        } else {
          setSpeechError(`Error: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInputValue(finalTranscript + interimTranscript);
        // If final, consider stopping recording or let user stop manually
        if (finalTranscript.trim() !== '') {
           // recognition.stop(); // Or let user explicitly stop
        }
      };
    } else {
      setSpeechRecognitionSupported(false);
      setSpeechError("Speech recognition is not supported in your browser.");
    }

    setMessages([
      { 
        id: Date.now().toString(), 
        text: "Hi there! I'm Expense Buddy. How can I help you with company expense policies or general queries today?", 
        sender: 'ai', 
        timestamp: new Date() 
      }
    ]);
    inputRef.current?.focus();
    
    return () => { // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // Use abort for immediate stop
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAiTyping(true);
    setChatError(null);
    setSpeechError(null);
    inputRef.current?.focus();

    try {
      const aiResponseText = await sendMessageToAssistant(trimmedInput);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Assistant error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error.message || 'Unable to connect.'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      setChatError(error.message || 'Unable to connect.');
    } finally {
      setIsAiTyping(false);
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = async () => {
    if (!speechRecognitionSupported || !recognitionRef.current) return;
    setSpeechError(null); // Clear previous speech errors

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        // Ensure microphone permission is granted before starting
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setInputValue(''); // Clear input before starting new recording
        recognitionRef.current.start();
      } catch (err) {
        console.error("Microphone access error:", err);
        setSpeechError("Microphone access denied or microphone not found. Please check permissions and hardware.");
        setIsRecording(false); // Ensure isRecording is false if permission fails
      }
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="chat-window-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[70vh] max-h-[600px] flex flex-col overflow-hidden">
        <header className="bg-brand-primary text-white p-4 flex justify-between items-center">
          <h2 id="chat-window-title" className="text-xl font-semibold">Expense Buddy - AI Assistant</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-teal-700" 
            aria-label="Close chat window"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow p-4 space-y-3 overflow-y-auto bg-gray-50">
          {messages.map(msg => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
          {isAiTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-700 p-3 rounded-lg max-w-xs animate-pulse">
                Expense Buddy is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {(chatError || speechError) && !isAiTyping && (
             <div className="p-2 border-t border-gray-200 bg-red-50">
                {chatError && <p className="text-xs text-red-600 text-center">Chat Error: {chatError}</p>}
                {speechError && <p className="text-xs text-red-600 text-center">Mic Error: {speechError}</p>}
             </div>
        )}

        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMicClick}
              disabled={!speechRecognitionSupported || isAiTyping}
              className={`p-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                          ${isRecording ? 'text-red-500 bg-red-100' : 'text-brand-primary'}`}
              aria-label={isRecording ? "Stop voice input" : "Start voice input"}
              title={isRecording ? "Stop voice input" : speechRecognitionSupported ? "Start voice input" : "Voice input not supported"}
            >
              {isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "Listening..." : "Ask about expense policies..."}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none text-sm"
              aria-label="Type your message for AI Assistant"
              disabled={isAiTyping || isRecording}
            />
            <button
              onClick={handleSendMessage}
              disabled={isAiTyping || inputValue.trim() === '' || isRecording}
              className="bg-brand-primary text-white p-3 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1 disabled:bg-gray-400 transition-colors"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
