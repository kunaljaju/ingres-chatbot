import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Language settings
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      // Model settings
      selectedModel: 'custom_trained',
      setSelectedModel: (model) => set({ selectedModel: model }),

      // Chat state
      messages: [],
      isLoading: false,
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      clearMessages: () => set({ messages: [] }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Prediction state
      predictionData: null,
      setPredictionData: (data) => set({ predictionData: data }),

      // History state
      historyData: [],
      setHistoryData: (data) => set({ historyData: data }),

      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme settings
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // User preferences
      preferences: {
        autoSave: true,
        notifications: true,
        soundEnabled: false,
        animationsEnabled: true,
      },
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),

      // API settings
      apiConfig: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
        modelServerUrl: import.meta.env.VITE_MODEL_SERVER_URL || 'http://localhost:8001',
        timeout: 30000,
      },
      updateApiConfig: (config) => set((state) => ({
        apiConfig: { ...state.apiConfig, ...config }
      })),

      // Health status
      healthStatus: {
        api: 'unknown',
        model: 'unknown',
        database: 'unknown',
      },
      setHealthStatus: (status) => set({ healthStatus: status }),

      // Error handling
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Analytics data
      analyticsData: {
        totalPredictions: 0,
        modelUsage: {},
        averageConfidence: 0,
        recentActivity: [],
      },
      setAnalyticsData: (data) => set({ analyticsData: data }),

      // Utility functions
      resetApp: () => set({
        messages: [],
        predictionData: null,
        historyData: [],
        error: null,
        isLoading: false,
      }),

      // Get current model status
      getModelStatus: () => {
        const { selectedModel, healthStatus } = get();
        return {
          selected: selectedModel,
          available: healthStatus.model === 'available',
          status: healthStatus.model,
        };
      },

      // Get current language info
      getLanguageInfo: () => {
        const { language } = get();
        const languages = {
          en: { name: 'English', nativeName: 'English' },
          hi: { name: 'Hindi', nativeName: 'हिन्दी' },
          mr: { name: 'Marathi', nativeName: 'मराठी' },
          ta: { name: 'Tamil', nativeName: 'தமிழ்' },
          bn: { name: 'Bengali', nativeName: 'বাংলা' },
          kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
          te: { name: 'Telugu', nativeName: 'తెలుగు' },
          gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
          ml: { name: 'Malayalam', nativeName: 'മലയാളം' },
          pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
          ur: { name: 'Urdu', nativeName: 'اردو' },
          or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
        };
        return languages[language] || languages.en;
      },
    }),
    {
      name: 'ingres-app-store',
      partialize: (state) => ({
        language: state.language,
        selectedModel: state.selectedModel,
        theme: state.theme,
        preferences: state.preferences,
        apiConfig: state.apiConfig,
      }),
    }
  )
);

export { useAppStore };
