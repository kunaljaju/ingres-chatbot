import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

const ChatInterface = () => {
  const { t } = useTranslation();
  const { messages, addMessage, isLoading, setLoading } = useAppStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      addMessage({
        id: Date.now(),
        type: 'ai',
        content: t('chat.welcome'),
        timestamp: new Date(),
      });
    }
  }, [messages.length, addMessage, t]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage('');
    setLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(inputMessage.trim()),
        timestamp: new Date(),
      };

      addMessage(aiResponse);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(t('chat.error'));
      
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: t('chat.error'),
        timestamp: new Date(),
        isError: true,
      };

      addMessage(errorResponse);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('groundwater') || message.includes('water')) {
      return "I can help you analyze groundwater levels and quality. You can use the prediction panel to get specific forecasts for any location and year. Would you like me to explain how to use the prediction features?";
    } else if (message.includes('prediction') || message.includes('forecast')) {
      return "To get groundwater predictions, simply enter a location in the prediction panel and select a year. I'll use our advanced AI model to provide detailed forecasts including groundwater levels, quality indices, and sustainability scores.";
    } else if (message.includes('history') || message.includes('historical')) {
      return "You can view historical groundwater data using the history panel. This will show you trends over time, including rainfall patterns and temperature correlations. This data helps in understanding long-term groundwater behavior.";
    } else if (message.includes('help') || message.includes('how')) {
      return "I'm here to help with groundwater analysis! You can:\n\n1. Get predictions for specific locations and years\n2. View historical data and trends\n3. Analyze groundwater quality and sustainability\n4. Access detailed analytics and insights\n\nWhat would you like to explore?";
    } else if (message.includes('model') || message.includes('ai')) {
      return "Our system uses a custom-trained AI model specifically designed for groundwater prediction. It analyzes multiple factors including location, climate, population density, and industrial activity to provide accurate forecasts.";
    } else {
      return "I'm your groundwater AI assistant! I can help you with predictions, historical analysis, and insights about groundwater resources. Feel free to ask me about specific locations, time periods, or any groundwater-related questions.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isError = message.isError;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-saffron-500/20 border border-saffron-500/30' 
              : isError 
                ? 'bg-red-500/20 border border-red-500/30'
                : 'bg-indianGreen-500/20 border border-indianGreen-500/30'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-saffron-500" />
            ) : (
              <Bot className={`w-4 h-4 ${isError ? 'text-red-500' : 'text-indianGreen-500'}`} />
            )}
          </div>

          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'chat-bubble-user' 
              : isError 
                ? 'bg-red-500/10 border border-red-500/30'
                : 'chat-bubble-ai'
          }`}>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
              isUser ? 'text-white' : isError ? 'text-red-300' : 'text-white'
            }`}>
              {message.content}
            </p>
            <p className={`text-xs mt-1 ${
              isUser ? 'text-saffron-300' : isError ? 'text-red-400' : 'text-indianGreen-300'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="card-glass p-6 h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indianGreen-500/20 border border-indianGreen-500/30 flex items-center justify-center">
          <Bot className="w-5 h-5 text-indianGreen-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t('chat.title')}
          </h3>
          <p className="text-sm text-gray-400">
            AI-powered groundwater assistant
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-indianGreen-500/20 border border-indianGreen-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indianGreen-500" />
              </div>
              <div className="chat-bubble-ai px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-indianGreen-500 animate-spin" />
                  <span className="text-sm text-white">{t('chat.thinking')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            className="w-full input-neon resize-none rounded-xl px-4 py-3 pr-12 min-h-[48px] max-h-32"
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        <motion.button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="btn-neon-green px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          'Show me groundwater trends',
          'Predict for Delhi 2025',
          'Historical data for Mumbai',
          'Water quality analysis'
        ].map((suggestion) => (
          <motion.button
            key={suggestion}
            onClick={() => setInputMessage(suggestion)}
            className="px-3 py-1 text-xs rounded-full glass hover:glass-strong text-gray-300 hover:text-saffron-500 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ChatInterface;
