import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const ModiQuote = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative max-w-2xl"
    >
      {/* Floating quote design */}
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 to-indianGreen-500/10 rounded-2xl blur-xl"></div>
        
        {/* Quote content */}
        <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-saffron-500/30 to-indianGreen-500/30 flex items-center justify-center">
                <Quote className="w-5 h-5 text-saffron-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <blockquote className="text-base leading-relaxed text-gray-200 mb-3 italic">
                "{t('modiQuote.text')}"
              </blockquote>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-saffron-500 to-indianGreen-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">NM</span>
                </div>
                <div>
                  <cite className="text-saffron-400 font-medium not-italic text-sm">
                    {t('modiQuote.author')}
                  </cite>
                  <p className="text-gray-500 text-xs">
                    {t('modiQuote.title')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ModiQuote;
