import React, { useState } from 'react';
import { MessageCircle, X, Send, Activity } from 'lucide-react';

const SocialButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Message sent:', message);
    setMessage('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center space-x-2"
        aria-label="Chat with us"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-medium">Hello, how can I help you today?</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-500" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Etta-Atlantic</h3>
                <p className="text-sm text-green-100">Our healthcare team is here to answer your questions.</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-600 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-gray-50 h-64 overflow-y-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <p className="text-gray-700">
                Hello, how can I help you today?
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Reply to Etta-Atlantic..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SocialButton;
