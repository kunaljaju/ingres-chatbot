import axios from 'axios';
import toast from 'react-hot-toast';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.modelServerURL = import.meta.env.VITE_MODEL_SERVER_URL || 'http://localhost:8001';
    
    // Create axios instances
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.modelClient = axios.create({
      baseURL: this.modelServerURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptors
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.modelClient.interceptors.request.use(
      (config) => {
        console.log(`Model Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Model Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.handleError(error, 'API');
        return Promise.reject(error);
      }
    );

    this.modelClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.handleError(error, 'Model Server');
        return Promise.reject(error);
      }
    );
  }

  handleError(error, service = 'API') {
    console.error(`${service} Error:`, error);
    
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.detail || data?.message || `HTTP ${status} Error`;
      
      switch (status) {
        case 400:
          toast.error(`Bad Request: ${message}`);
          break;
        case 401:
          toast.error('Unauthorized: Please check your credentials');
          break;
        case 403:
          toast.error('Forbidden: Access denied');
          break;
        case 404:
          toast.error('Not Found: Resource not available');
          break;
        case 500:
          toast.error(`Server Error: ${message}`);
          break;
        case 503:
          toast.error('Service Unavailable: Please try again later');
          break;
        default:
          toast.error(`Error: ${message}`);
      }
    } else if (error.request) {
      toast.error('Network Error: Unable to connect to server');
    } else {
      toast.error(`Error: ${error.message}`);
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        services: { api: 'error' },
        message: 'Health check failed'
      };
    }
  }

  // Model server health check
  async checkModelHealth() {
    try {
      const response = await this.modelClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Model health check failed:', error);
      return {
        status: 'unhealthy',
        services: { model_server: 'error' },
        message: 'Model server health check failed'
      };
    }
  }

  // Get model info
  async getModelInfo() {
    try {
      const response = await this.modelClient.get('/model-info');
      return response.data;
    } catch (error) {
      console.error('Failed to get model info:', error);
      return {
        model_loaded: false,
        message: 'Failed to get model information'
      };
    }
  }

  // List model files
  async listModelFiles() {
    try {
      const response = await this.modelClient.get('/model-files');
      return response.data;
    } catch (error) {
      console.error('Failed to list model files:', error);
      return {
        model_directory: '/models/your-trained-model',
        exists: false,
        files: []
      };
    }
  }

  // Groundwater prediction
  async predictGroundwater(location, year, additionalParams = {}) {
    try {
      const payload = {
        location,
        year,
        additional_params: additionalParams
      };

      const response = await this.apiClient.post('/predict', payload);
      return response.data;
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  // Get historical data
  async getGroundwaterHistory(location, startYear = 2000, endYear = 2024) {
    try {
      const payload = {
        location,
        start_year: startYear,
        end_year: endYear
      };

      const response = await this.apiClient.post('/history', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to get historical data:', error);
      throw error;
    }
  }

  // Chat with AI (placeholder for future implementation)
  async chatWithAI(message, context = {}) {
    try {
      // This would be implemented when integrating with OpenAI or other chat services
      const response = await this.apiClient.post('/chat', {
        message,
        context,
        model: 'custom_trained'
      });
      return response.data;
    } catch (error) {
      console.error('Chat failed:', error);
      throw error;
    }
  }

  // Get analytics data
  async getAnalyticsData(days = 30) {
    try {
      const response = await this.apiClient.get(`/analytics?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      throw error;
    }
  }

  // Update API configuration
  updateConfig(config) {
    if (config.baseURL) {
      this.baseURL = config.baseURL;
      this.apiClient.defaults.baseURL = config.baseURL;
    }
    
    if (config.modelServerURL) {
      this.modelServerURL = config.modelServerURL;
      this.modelClient.defaults.baseURL = config.modelServerURL;
    }

    if (config.timeout) {
      this.apiClient.defaults.timeout = config.timeout;
      this.modelClient.defaults.timeout = config.timeout;
    }
  }

  // Utility methods
  async testConnection() {
    try {
      const [apiHealth, modelHealth] = await Promise.all([
        this.checkHealth(),
        this.checkModelHealth()
      ]);

      return {
        api: apiHealth.status === 'healthy',
        model: modelHealth.status === 'healthy',
        details: {
          api: apiHealth,
          model: modelHealth
        }
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        api: false,
        model: false,
        error: error.message
      };
    }
  }

  // Get available models
  async getAvailableModels() {
    try {
      const modelInfo = await this.getModelInfo();
      return {
        custom_trained: {
          name: 'Custom Trained Model',
          available: modelInfo.model_loaded,
          description: 'Your custom trained groundwater prediction model'
        }
      };
    } catch (error) {
      console.error('Failed to get available models:', error);
      return {
        custom_trained: {
          name: 'Custom Trained Model',
          available: false,
          description: 'Your custom trained groundwater prediction model'
        }
      };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
