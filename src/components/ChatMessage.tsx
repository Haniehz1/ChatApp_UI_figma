interface ChatMessageProps {
  message: {
    text: string;
    sender: 'bot' | 'user';
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isBot
            ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-tl-none'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}
