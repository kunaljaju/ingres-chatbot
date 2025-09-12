import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Import i18n
import './i18n';

// Import components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ChatInterface from './components/chat/ChatInterface';
import PredictionPanel from './components/prediction/PredictionPanel';
import HistoryPanel from './components/history/HistoryPanel';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import ModelSelector from './components/chat/ModelSelector';
import ModiQuote from './components/common/ModiQuote';

// Import stores
import { useAppStore } from './stores/appStore';

function App() {
  const { language, setLanguage } = useAppStore();

  useEffect(() => {
    // Initialize app
    console.log('INGRES AI ChatBot initialized');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-saffron-500/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indianGreen-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-2xl animate-pulse-glow"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  {/* Hero Section */}
                  <div className="text-center mb-8">
                    <motion.h1 
                      className="text-4xl md:text-6xl font-bold text-gradient mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      INGRES AI
                    </motion.h1>
                    <motion.p 
                      className="text-lg md:text-xl text-gray-300 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Groundwater Intelligence for Sustainable Water Management
                    </motion.p>
                  </div>

                  {/* Model Status and Quote */}
                  <motion.div
                    className="flex flex-col lg:flex-row gap-6 justify-center items-start max-w-5xl mx-auto mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <div className="flex-1">
                      <ModelSelector />
                    </div>
                    <div className="flex-1">
                      <ModiQuote />
                    </div>
                  </motion.div>

                  {/* Main Interface Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <ChatInterface />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <PredictionPanel />
                    </motion.div>
                  </div>

                  {/* Historical Data - Full Width */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="w-full"
                  >
                    <HistoryPanel />
                  </motion.div>
                </motion.div>
              } />
              
              <Route path="/analytics" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <AnalyticsDashboard />
                </motion.div>
              } />
            </Routes>
          </main>
          
          <Footer />
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 153, 51, 0.3)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#138808',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
