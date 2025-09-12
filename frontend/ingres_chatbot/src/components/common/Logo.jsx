import React from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../assets/logo.png';

const Logo = ({ size = 'default', className = '', showText = false }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={sizeClasses[size]}>
        <img
          src={logoImage}
          alt="INGRES AI Logo"
          className="w-full h-full object-contain"
        />
      </div>
      
      {showText && (
        <div className="mt-2 text-center">
          <div className="text-lg font-bold text-saffron-500">INGRES AI</div>
          <div className="text-sm font-semibold text-indianGreen-500">CHATBOT</div>
        </div>
      )}
    </motion.div>
  );
};

export default Logo;
