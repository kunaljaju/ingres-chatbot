import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Globe, Droplets, MapPin, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const { analyticsData, setAnalyticsData, addChatMessage } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAnalyticsData(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: t('analytics.totalPredictions'),
      value: analyticsData.totalPredictions || 0,
      icon: BarChart3,
      color: 'saffron',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: t('analytics.modelAccuracy'),
      value: `${((analyticsData.averageConfidence || 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'indianGreen',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: t('analytics.regionsAnalyzed'),
      value: analyticsData.regionsAnalyzed || 0,
      icon: MapPin,
      color: 'saffron',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: t('analytics.activeUsers'),
      value: analyticsData.activeUsers || 0,
      icon: Globe,
      color: 'indianGreen',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  const handleInsightClick = (insight) => {
    const prompts = {
      'Water Stress Analysis': 'Show me regions with critical groundwater levels and areas that need immediate attention for water conservation.',
      'Sustainable Practices': 'Which regions are implementing effective water conservation practices and what can other areas learn from them?',
      'Climate Impact': 'How do weather patterns and climate change affect groundwater levels in different regions?',
      'Seasonal Trends': 'What are the seasonal variations in groundwater levels and how do they impact water availability?'
    };

    const prompt = prompts[insight.title];
    if (prompt) {
      // Add the prompt to chat messages
      addChatMessage({
        id: Date.now(),
        text: prompt,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      
      // Navigate to home page (chat interface)
      navigate('/');
      
      toast.success(`Navigating to chat with: ${insight.title}`);
    }
  };

  const insights = [
    {
      title: t('analytics.waterStressAnalysis'),
      description: t('analytics.waterStressDescription'),
      icon: AlertTriangle,
      color: 'red',
      data: analyticsData.stressRegions || 0,
      trend: '+2 regions this month'
    },
    {
      title: t('analytics.sustainablePractices'),
      description: t('analytics.sustainablePracticesDescription'),
      icon: CheckCircle,
      color: 'green',
      data: analyticsData.sustainableRegions || 0,
      trend: '+15% improvement'
    },
    {
      title: t('analytics.climateImpact'),
      description: t('analytics.climateImpactDescription'),
      icon: Globe,
      color: 'blue',
      data: analyticsData.climateCorrelations || 0,
      trend: 'Strong correlation detected'
    },
    {
      title: t('analytics.seasonalTrends'),
      description: t('analytics.seasonalTrendsDescription'),
      icon: Calendar,
      color: 'saffron',
      data: analyticsData.seasonalVariations || 0,
      trend: 'Peak in monsoon season'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-saffron-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indianGreen-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            {t('analytics.title')}
          </h1>
          <p className="text-lg text-gray-300">
            {t('analytics.subtitle')}
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex space-x-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-1">
            {[7, 30, 90, 365].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  timeRange === days
                    ? 'bg-saffron-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {days === 365 ? '1 Year' : `${days} Days`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 to-indianGreen-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 border border-${stat.color}-500/30 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                    </div>
                    <div className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-indianGreen-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                className="relative cursor-pointer"
                onClick={() => handleInsightClick(insight)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 to-indianGreen-500/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-${insight.color}-500/20 border border-${insight.color}-500/30 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${insight.color}-500`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 hover:text-saffron-400 transition-colors">{insight.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-white">{insight.data}</div>
                        <div className="text-xs text-gray-500">{insight.trend}</div>
                      </div>
                      <div className="mt-3 text-xs text-saffron-400 opacity-0 hover:opacity-100 transition-opacity">
                        Click to explore in chat →
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Water Quality Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 to-indianGreen-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indianGreen-500/20 border border-indianGreen-500/30 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-indianGreen-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Water Quality Distribution</h3>
                <p className="text-sm text-gray-400">Regional water quality assessment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indianGreen-400 mb-2">65%</div>
                <div className="text-sm text-gray-400">Excellent Quality</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-indianGreen-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-saffron-400 mb-2">25%</div>
                <div className="text-sm text-gray-400">Good Quality</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-saffron-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">10%</div>
                <div className="text-sm text-gray-400">Needs Attention</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black/80 border border-white/10 rounded-2xl p-8 text-center">
              <div className="spinner-neon w-8 h-8 mx-auto mb-4"></div>
              <p className="text-white">Loading analytics data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;