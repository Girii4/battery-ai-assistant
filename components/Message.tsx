
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, MessageSender } from '../types';
import { BoltIcon } from './icons/BoltIcon';

interface MessageProps {
  message: Message;
}

const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center font-bold text-white text-sm">
        U
    </div>
);

const AIAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center">
        <BoltIcon className="w-5 h-5 text-white" />
    </div>
);


export const ChatMessage: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  return (
    <div className={`flex items-start gap-4 p-4 ${isUser ? '' : 'bg-dark-surface'}`}>
      <div className="flex-shrink-0">
        {isUser ? <UserAvatar /> : <AIAvatar />}
      </div>
      <div className="flex-1 pt-1">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
            li: ({node, ...props}) => <li className="mb-2" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-dark-surface-2 pl-4 italic text-dark-text-secondary my-4" {...props} />,
            code: ({node, inline, ...props}) => 
                inline ? <code className="bg-dark-surface-2 text-brand-green px-1 py-0.5 rounded" {...props} /> 
                       : <pre className="bg-dark-surface-2 p-4 rounded-lg overflow-x-auto my-4"><code {...props} /></pre>,
            table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse" {...props} /></div>,
            thead: ({node, ...props}) => <thead className="bg-dark-surface-2" {...props} />,
            th: ({node, ...props}) => <th className="border border-dark-surface-2 px-4 py-2 font-semibold" {...props} />,
            td: ({node, ...props}) => <td className="border border-dark-surface-2 px-4 py-2" {...props} />,
          }}
          className="prose prose-invert max-w-none"
        >
          {message.text}
        </ReactMarkdown>
      </div>
    </div>
  );
};
