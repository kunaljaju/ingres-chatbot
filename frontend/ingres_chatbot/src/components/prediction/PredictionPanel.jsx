import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Zap, TrendingUp, Droplets, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

const PredictionPanel = () => {
  const { t } = useTranslation();
  const { selectedModel, setPredictionData, predictionData } = useAppStore();
  const [formData, setFormData] = useState({
    location: '',
    year: new Date().getFullYear() + 1
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    if (formData.year < 1900 || formData.year > 2100) {
      toast.error('Please enter a valid year (1900-2100)');
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.predictGroundwater(
        formData.location,
        formData.year
      );

      setPredictionData(result);
      toast.success('Prediction generated successfully!');
    } catch (error) {
      console.error('Prediction failed:', error);
      toast.error('Failed to generate prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-indianGreen-400';
    if (confidence >= 0.6) return 'text-saffron-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getLevelColor = (level) => {
    if (level >= 70) return 'text-indianGreen-400';
    if (level >= 40) return 'text-saffron-400';
    return 'text-red-400';
  };

  const getLevelStatus = (level) => {
    if (level >= 70) return 'Excellent';
    if (level >= 40) return 'Moderate';
    return 'Critical';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card-glass p-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-saffron-500/20 border border-saffron-500/30 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-saffron-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t('prediction.title')}
          </h3>
          <p className="text-sm text-gray-400">
            AI-powered groundwater forecasting
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            {t('prediction.location')}
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

        {/* Year Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('prediction.year')}
          </label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
            min="1900"
            max="2100"
            className="w-full input-neon"
            disabled={isLoading}
          />
        </div>

        {/* Predict Button */}
        <motion.button
          onClick={handlePredict}
          disabled={isLoading || !formData.location.trim()}
          className="w-full btn-neon py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <div className="spinner-neon w-5 h-5"></div>
              <span>{t('prediction.loading')}</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>{t('prediction.predict')}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Results */}
      {predictionData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-indianGreen-500" />
              <span>{t('prediction.results')}</span>
            </h4>

            {/* Prediction Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* Groundwater Level */}
              <div className="p-4 rounded-xl glass border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white">{t('prediction.groundwaterLevel')}</h5>
                  <span className={`text-sm font-bold ${getLevelColor(predictionData.prediction.groundwater_level)}`}>
                    {predictionData.prediction.groundwater_level.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      predictionData.prediction.groundwater_level >= 70 ? 'bg-indianGreen-500' :
                      predictionData.prediction.groundwater_level >= 40 ? 'bg-saffron-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(predictionData.prediction.groundwater_level, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Status: <span className={getLevelColor(predictionData.prediction.groundwater_level)}>
                    {getLevelStatus(predictionData.prediction.groundwater_level)}
                  </span>
                </p>
              </div>

              {/* Quality Index */}
              <div className="p-4 rounded-xl glass border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white">{t('prediction.qualityIndex')}</h5>
                  <span className="text-sm font-bold text-indianGreen-400">
                    {predictionData.prediction.quality_index.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-indianGreen-500 transition-all duration-1000"
                    style={{ width: `${Math.min(predictionData.prediction.quality_index, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Water quality assessment
                </p>
              </div>

              {/* Sustainability Score */}
              <div className="p-4 rounded-xl glass border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-white">{t('prediction.sustainabilityScore')}</h5>
                  <span className="text-sm font-bold text-saffron-400">
                    {predictionData.prediction.sustainability_score.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-saffron-500 transition-all duration-1000"
                    style={{ width: `${Math.min(predictionData.prediction.sustainability_score, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Long-term sustainability
                </p>
              </div>
            </div>

            {/* Model Info */}
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{t('prediction.modelUsed')}:</span>
                <span className="text-saffron-400 font-medium">
                  {predictionData.model_used === 'custom_trained' ? 'Custom Model' : 'Fallback Model'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-300">{t('prediction.confidence')}:</span>
                <span className={`font-medium flex items-center space-x-1 ${getConfidenceColor(predictionData.confidence)}`}>
                  {getConfidenceIcon(predictionData.confidence)}
                  <span>{(predictionData.confidence * 100).toFixed(1)}%</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-300">Location:</span>
                <span className="text-white font-medium">{predictionData.location}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-300">Year:</span>
                <span className="text-white font-medium">{predictionData.year}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Location Buttons */}
      <div className="mt-6">
        <h5 className="text-sm font-medium text-gray-300 mb-3">Quick Locations</h5>
        <div className="flex flex-wrap gap-2">
          {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'].map((location) => (
            <motion.button
              key={location}
              onClick={() => handleInputChange('location', location)}
              className="px-3 py-1 text-xs rounded-full glass hover:glass-strong text-gray-300 hover:text-saffron-500 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {location}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionPanel;
