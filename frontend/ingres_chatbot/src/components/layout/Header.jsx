import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, Settings, Menu, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import Logo from '../common/Logo';
import i18n from '../../i18n';

const Header = () => {
  const { t } = useTranslation();
  const { language, setLanguage, getLanguageInfo } = useAppStore();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  ];

  const currentLanguage = getLanguageInfo();

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    // Actually change the i18n language
    i18n.changeLanguage(langCode);
    setIsLanguageMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 glass-strong border-b border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Logo size="default" />
            <div>
              <h1 className="text-xl font-bold text-gradient">
                {t('header.title')}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {t('header.subtitle')}
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <motion.a
              href="/"
              className="text-gray-300 hover:text-saffron-500 transition-colors duration-300"
              whileHover={{ y: -2 }}
            >
              {t('navigation.home')}
            </motion.a>
            <motion.a
              href="/analytics"
              className="text-gray-300 hover:text-indianGreen-500 transition-colors duration-300"
              whileHover={{ y: -2 }}
            >
              {t('navigation.analytics')}
            </motion.a>
          </nav>

          {/* Language Selector and Settings */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg glass hover:glass-strong transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="w-4 h-4 text-saffron-500" />
                <span className="text-sm font-medium text-white">
                  {currentLanguage.nativeName}
                </span>
              </motion.button>

              {/* Language Dropdown */}
              {isLanguageMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 glass-strong rounded-lg shadow-xl border border-white/10 overflow-hidden"
                >
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2 text-left hover:bg-white/5 transition-colors duration-200 ${
                          language === lang.code ? 'bg-saffron-500/20 text-saffron-500' : 'text-gray-300'
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{lang.nativeName}</span>
                          <span className="text-xs text-gray-400">{lang.name}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Settings Button */}
            <motion.button
              className="p-2 rounded-lg glass hover:glass-strong transition-all duration-300"
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5 text-gray-300 hover:text-saffron-500 transition-colors duration-300" />
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass hover:glass-strong transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 py-4"
          >
            <nav className="flex flex-col space-y-2">
              <motion.a
                href="/"
                className="px-4 py-2 text-gray-300 hover:text-saffron-500 transition-colors duration-300 rounded-lg hover:bg-white/5"
                whileHover={{ x: 4 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.home')}
              </motion.a>
              <motion.a
                href="/analytics"
                className="px-4 py-2 text-gray-300 hover:text-indianGreen-500 transition-colors duration-300 rounded-lg hover:bg-white/5"
                whileHover={{ x: 4 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('navigation.analytics')}
              </motion.a>
            </nav>
          </motion.div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isLanguageMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLanguageMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </motion.header>
  );
};

export default Header;
