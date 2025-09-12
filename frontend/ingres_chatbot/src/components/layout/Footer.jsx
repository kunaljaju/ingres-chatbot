import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/ingres-ai',
      color: 'hover:text-gray-300'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/ingres_ai',
      color: 'hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com/company/ingres-ai',
      color: 'hover:text-blue-500'
    },
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:contact@ingres-ai.com',
      color: 'hover:text-saffron-500'
    }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="border-t border-white/10 glass-strong mt-auto"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Logo size="large" />
              <div>
                <h3 className="text-xl font-bold text-gradient">
                  INGRES AI
                </h3>
                <p className="text-sm text-gray-400">
                  Groundwater Intelligence
                </p>
              </div>
            </motion.div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('app.description')}
            </p>
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-2">About INGRES AI</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                We are an advanced AI-powered groundwater intelligence platform that combines machine learning, 
                environmental data, and predictive analytics to help communities, researchers, and policymakers 
                make informed decisions about water resource management. Our system provides real-time insights, 
                historical analysis, and future predictions to ensure sustainable water management across India.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Quick Links
            </h4>
            <nav className="space-y-2">
              <motion.a
                href="/"
                className="block text-gray-300 hover:text-saffron-500 transition-colors duration-300"
                whileHover={{ x: 4 }}
              >
                {t('navigation.home')}
              </motion.a>
              <motion.a
                href="/analytics"
                className="block text-gray-300 hover:text-indianGreen-500 transition-colors duration-300"
                whileHover={{ x: 4 }}
              >
                {t('navigation.analytics')}
              </motion.a>
              <motion.a
                href="#about"
                className="block text-gray-300 hover:text-saffron-500 transition-colors duration-300"
                whileHover={{ x: 4 }}
              >
                {t('navigation.about')}
              </motion.a>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Connect With Us
            </h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg glass hover:glass-strong transition-all duration-300 text-gray-400 ${social.color}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
            <div className="text-sm text-gray-400">
              <p>Email: contact@ingres-ai.com</p>
              <p>Phone: +91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              <p>{t('footer.copyright').replace('2024', currentYear)}</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <motion.a
                href="#privacy"
                className="hover:text-saffron-500 transition-colors duration-300"
                whileHover={{ y: -1 }}
              >
                Privacy Policy
              </motion.a>
              <motion.a
                href="#terms"
                className="hover:text-indianGreen-500 transition-colors duration-300"
                whileHover={{ y: -1 }}
              >
                Terms of Service
              </motion.a>
              <motion.a
                href="#help"
                className="hover:text-saffron-500 transition-colors duration-300"
                whileHover={{ y: -1 }}
              >
                {t('common.help')}
              </motion.a>
            </div>
            <div className="text-sm text-gray-500">
              <p>{t('footer.poweredBy')}</p>
              <p className="text-xs">{t('footer.version')}</p>
            </div>
          </div>
        </div>

        {/* Water Drop Animation */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <motion.div
            className="w-2 h-2 bg-saffron-500 rounded-full opacity-30"
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
