import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

const ModelSelector = () => {
  const { t } = useTranslation();
  const { selectedModel, setSelectedModel, healthStatus, setHealthStatus } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    setIsLoading(true);
    try {
      const [health, info] = await Promise.all([
        apiService.checkModelHealth(),
        apiService.getModelInfo()
      ]);
      
      setHealthStatus({
        ...healthStatus,
        model: health.services?.custom_model || 'unavailable'
      });
      
      setModelInfo(info);
    } catch (error) {
      console.error('Failed to check model status:', error);
      setHealthStatus({
        ...healthStatus,
        model: 'unavailable'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    toast.success(`Switched to Custom Model`);
  };

  const getModelStatus = () => {
    if (isLoading) return 'loading';
    return healthStatus.model === 'available' ? 'available' : 'unavailable';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return t('model.statusAvailable');
      case 'loading':
        return t('model.statusLoading');
      case 'unavailable':
        return t('model.statusUnavailable');
      default:
        return 'Unknown';
    }
  };

  const models = [
    {
      id: 'custom_trained',
      name: t('model.custom'),
      description: 'Your trained groundwater model',
      icon: Cpu,
      color: 'indianGreen',
      status: getModelStatus()
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indianGreen-500/10 to-saffron-500/10 rounded-2xl blur-xl"></div>
      
      {/* Model status card */}
      <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-saffron-500" />
            <span>{t('model.status')}</span>
          </h3>
          <motion.button
            onClick={checkModelStatus}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <Loader2 className={`w-4 h-4 text-saffron-500 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        <div className="space-y-3">
          {models.map((model) => {
            const Icon = model.icon;
            const isSelected = selectedModel === model.id;
            const status = model.status;

            return (
              <motion.div
                key={model.id}
                className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-indianGreen-500 bg-indianGreen-500/10'
                    : 'border-white/20 bg-white/5 hover:border-white/30'
                }`}
                onClick={() => handleModelChange(model.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected 
                        ? 'bg-indianGreen-500/20 border border-indianGreen-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isSelected ? 'text-indianGreen-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{model.name}</h4>
                      <p className="text-sm text-gray-400">{model.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'available' 
                        ? 'bg-green-500/20 text-green-400' 
                        : status === 'loading'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {status === 'available' && <CheckCircle className="w-3 h-3" />}
                      {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {status === 'unavailable' && <AlertCircle className="w-3 h-3" />}
                      <span>{getStatusText(status)}</span>
                    </div>
                    
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-indianGreen-500 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {modelInfo && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">
              <span className="font-medium">Model:</span> {modelInfo.model_name || 'Custom Groundwater Model'}
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-medium">Status:</span> {modelInfo.model_loaded ? 'Loaded' : 'Not Loaded'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ModelSelector;