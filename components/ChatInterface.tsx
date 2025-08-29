
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, MessageSender, UploadedFile } from '../types';
import { generateResponse } from '../services/geminiService';
import { ChatMessage } from './Message';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { SendIcon } from './icons/SendIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import toast from 'react-hot-toast';

const TypingIndicator = () => (
    <div className="flex items-center justify-center p-4">
        <div className="flex space-x-2">
            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></div>
        </div>
    </div>
);

const WelcomeMessage = () => (
  <div className="text-center p-8">
    <h2 className="text-3xl font-bold mb-2">Welcome to the Battery AI Assistant</h2>
    <p className="text-dark-text-secondary">Ask me anything about battery technology, or upload a document to get started.</p>
  </div>
);

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    const readPromises: Promise<void>[] = [];

    Array.from(selectedFiles).forEach(file => {
      const promise = new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            newFiles.push({ name: file.name, content });
            resolve();
          } else {
            reject(new Error(`Could not read file: ${file.name}`));
          }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
      readPromises.push(promise);
    });

    Promise.all(readPromises)
      .then(() => {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        toast.success(`${newFiles.length} file(s) attached.`);
      })
      .catch(error => {
        console.error("Error reading files:", error);
        toast.error('Failed to read one or more files.');
      });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (fileName: string) => {
    setFiles(files.filter(f => f.name !== fileName));
    toast.success(`File "${fileName}" removed.`);
  };


  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: MessageSender.USER,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await generateResponse(input, files);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: MessageSender.AI,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: MessageSender.AI,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, files, isLoading]);

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading && <WelcomeMessage />}
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-dark-surface-2">
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map(file => (
              <div key={file.name} className="flex items-center bg-dark-surface-2 px-3 py-1.5 rounded-full text-sm">
                <DocumentIcon className="w-4 h-4 mr-2 text-brand-blue" />
                <span>{file.name}</span>
                <button
                  onClick={() => removeFile(file.name)}
                  className="ml-2 text-dark-text-secondary hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-4 bg-dark-surface rounded-full p-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-dark-text-secondary hover:text-white transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue"
            aria-label="Attach file"
          >
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about batteries or your documents..."
            className="flex-1 bg-transparent focus:outline-none text-dark-text placeholder-dark-text-secondary px-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className="p-2 text-white bg-brand-green rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-dark-surface"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
