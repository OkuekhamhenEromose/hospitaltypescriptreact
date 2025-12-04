import React, { useState } from 'react';
import { X, Send, Activity } from 'lucide-react';
import Whatsapp from '../assets/img/whatsapp-logo-removebg-preview.png';

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
      {/* WhatsApp Button - Icon only on mobile, icon+text on desktop */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Mobile: Circle with WhatsApp icon only */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center"
          aria-label="Chat with us on WhatsApp"
        >
          <img
            src={Whatsapp}
            alt="WhatsApp"
            className="w-8 h-8"
          />
        </button>
        
        {/* Desktop: Button with icon and text */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden sm:flex bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors items-center space-x-2"
          aria-label="Chat with us on WhatsApp"
        >
          <img
            src={Whatsapp}
            alt="WhatsApp"
            className="w-5 h-5"
          />
          <span className="font-medium">Hello, how can I help you today?</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-80 sm:w-96 bg-white rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Rest of the chat window stays the same... */}
          <div className="bg-green-500 text-white p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Etta-Atlantic</h3>
                <p className="text-xs sm:text-sm text-green-100">
                  Our healthcare team is here to answer your questions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-green-600 rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 h-48 sm:h-64 overflow-y-auto">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-3 sm:mb-4">
              <p className="text-gray-700 text-sm sm:text-base">
                Hello, how can I help you today?
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Reply to Etta-Atlantic..."
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SocialButton;