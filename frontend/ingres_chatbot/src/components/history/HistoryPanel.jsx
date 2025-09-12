import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, MapPin, Download, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

const HistoryPanel = () => {
  const { t } = useTranslation();
  const { setHistoryData, historyData } = useAppStore();
  const [formData, setFormData] = useState({
    location: '',
    startYear: 2020,
    endYear: 2024
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLoadHistory = async () => {
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    if (formData.startYear > formData.endYear) {
      toast.error('Start year must be less than or equal to end year');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.getGroundwaterHistory(
        formData.location,
        formData.startYear,
        formData.endYear
      );

      setHistoryData(result.data || []);
      toast.success('Historical data loaded successfully!');
    } catch (error) {
      console.error('Failed to load historical data:', error);
      toast.error('Failed to load historical data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrend = (data, field) => {
    if (data.length < 2) return 0;
    const first = data[0][field];
    const last = data[data.length - 1][field];
    return ((last - first) / first) * 100;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-indianGreen-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-indianGreen-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatTrend = (trend) => {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indianGreen-500/10 to-saffron-500/10 rounded-2xl blur-xl"></div>
      
      {/* Main container */}
      <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indianGreen-500/20 border border-indianGreen-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indianGreen-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {t('history.title')}
              </h3>
              <p className="text-sm text-gray-400">
                Historical groundwater analysis
              </p>
            </div>
          </div>
          
          {historyData.length > 0 && (
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4 text-gray-300" />
            </motion.button>
          )}
        </div>

        {/* Horizontal Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Controls */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="space-y-4">
              {/* Location Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {t('history.location')}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('prediction.locationPlaceholder')}
                  className="w-full input-neon"
                  disabled={isLoading}
                />
              </div>

              {/* Year Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {t('history.startYear')}
                  </label>
                  <input
                    type="number"
                    value={formData.startYear}
                    onChange={(e) => handleInputChange('startYear', parseInt(e.target.value))}
                    min="1900"
                    max="2100"
                    className="w-full input-neon"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {t('history.endYear')}
                  </label>
                  <input
                    type="number"
                    value={formData.endYear}
                    onChange={(e) => handleInputChange('endYear', parseInt(e.target.value))}
                    min="1900"
                    max="2100"
                    className="w-full input-neon"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Load Button */}
              <motion.button
                onClick={handleLoadHistory}
                disabled={isLoading || !formData.location.trim()}
                className="w-full btn-neon-green py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('history.loading')}</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    <span>{t('history.loadData')}</span>
                  </>
                )}
              </motion.button>

              {/* Quick Location Buttons */}
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-3">Quick Locations</h5>
                <div className="flex flex-wrap gap-2">
                  {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'].map((location) => (
                    <motion.button
                      key={location}
                      onClick={() => handleInputChange('location', location)}
                      className="px-3 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-indianGreen-500 transition-all duration-300 border border-white/10"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {location}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Results */}
          <div className="flex-1">
            {historyData.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Trend Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Groundwater Level</span>
                      {getTrendIcon(calculateTrend(historyData, 'groundwater_level'))}
                    </div>
                    <div className={`text-xl font-bold ${getTrendColor(calculateTrend(historyData, 'groundwater_level'))}`}>
                      {formatTrend(calculateTrend(historyData, 'groundwater_level'))}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formData.startYear} - {formData.endYear}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Quality Index</span>
                      {getTrendIcon(calculateTrend(historyData, 'quality_index'))}
                    </div>
                    <div className={`text-xl font-bold ${getTrendColor(calculateTrend(historyData, 'quality_index'))}`}>
                      {formatTrend(calculateTrend(historyData, 'quality_index'))}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formData.startYear} - {formData.endYear}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Sustainability</span>
                      {getTrendIcon(calculateTrend(historyData, 'sustainability_score'))}
                    </div>
                    <div className={`text-xl font-bold ${getTrendColor(calculateTrend(historyData, 'sustainability_score'))}`}>
                      {formatTrend(calculateTrend(historyData, 'sustainability_score'))}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formData.startYear} - {formData.endYear}
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 text-gray-300">Year</th>
                        <th className="text-right py-3 text-gray-300">Level</th>
                        <th className="text-right py-3 text-gray-300">Quality</th>
                        <th className="text-right py-3 text-gray-300">Sustainability</th>
                        <th className="text-right py-3 text-gray-300">Rainfall</th>
                        <th className="text-right py-3 text-gray-300">Temp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, index) => (
                        <motion.tr
                          key={item.year}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="py-3 text-white font-medium">{item.year}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              item.groundwater_level >= 70 ? 'text-indianGreen-400' :
                              item.groundwater_level >= 40 ? 'text-saffron-400' : 'text-red-400'
                            }`}>
                              {item.groundwater_level?.toFixed(1) || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 text-right text-indianGreen-400">
                            {item.quality_index?.toFixed(1) || 'N/A'}
                          </td>
                          <td className="py-3 text-right text-saffron-400">
                            {item.sustainability_score?.toFixed(1) || 'N/A'}
                          </td>
                          <td className="py-3 text-right text-gray-300">
                            {item.rainfall_mm?.toFixed(0) || 'N/A'}mm
                          </td>
                          <td className="py-3 text-right text-gray-300">
                            {item.temperature_c?.toFixed(1) || 'N/A'}°C
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h5 className="text-sm font-medium text-white mb-3">Summary Statistics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Avg Level:</span>
                      <div className="text-white font-medium">
                        {(historyData.reduce((sum, item) => sum + (item.groundwater_level || 0), 0) / historyData.length).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Quality:</span>
                      <div className="text-white font-medium">
                        {(historyData.reduce((sum, item) => sum + (item.quality_index || 0), 0) / historyData.length).toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Rainfall:</span>
                      <div className="text-white font-medium">
                        {(historyData.reduce((sum, item) => sum + (item.rainfall_mm || 0), 0) / historyData.length).toFixed(0)}mm
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Data Points:</span>
                      <div className="text-white font-medium">{historyData.length}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">{t('history.noData')}</p>
                <p className="text-gray-500 text-sm mt-2">Enter a location and click "Load Historical Data" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryPanel;