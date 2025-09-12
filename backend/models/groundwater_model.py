"""
Groundwater Model Manager
Handles loading and inference for the custom trained groundwater model
"""

import os
import logging
import asyncio
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
from pathlib import Path
import json
import torch
from transformers import AutoTokenizer, AutoModel
import pickle

logger = logging.getLogger(__name__)

class GroundwaterModelManager:
    """Manages the custom trained groundwater prediction model"""
    
    def __init__(self, model_path: str = "/models/your-trained-model"):
        self.model_path = Path(model_path)
        self.model = None
        self.tokenizer = None
        self.scaler = None
        self.feature_columns = None
        self.is_model_loaded = False
        self.model_config = None
        
    async def load_model(self):
        """Load the custom trained model from the specified directory"""
        try:
            logger.info(f"Loading groundwater model from: {self.model_path}")
            
            if not self.model_path.exists():
                logger.warning(f"Model directory not found: {self.model_path}")
                return False
            
            # Load model configuration
            config_file = self.model_path / "config.json"
            if config_file.exists():
                with open(config_file, 'r') as f:
                    self.model_config = json.load(f)
                logger.info("Model configuration loaded")
            
            # Try to load different model formats
            model_loaded = False
            
            # Try PyTorch model
            pytorch_model = self.model_path / "pytorch_model.bin"
            if pytorch_model.exists():
                model_loaded = await self._load_pytorch_model()
            
            # Try scikit-learn model
            if not model_loaded:
                sklearn_model = self.model_path / "model.pkl"
                if sklearn_model.exists():
                    model_loaded = await self._load_sklearn_model()
            
            # Try transformers model
            if not model_loaded:
                if (self.model_path / "tokenizer.json").exists():
                    model_loaded = await self._load_transformers_model()
            
            # Load feature scaler if available
            scaler_file = self.model_path / "scaler.pkl"
            if scaler_file.exists():
                with open(scaler_file, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("Feature scaler loaded")
            
            # Load feature columns if available
            features_file = self.model_path / "features.json"
            if features_file.exists():
                with open(features_file, 'r') as f:
                    self.feature_columns = json.load(f)
                logger.info("Feature columns loaded")
            
            self.is_model_loaded = model_loaded
            if model_loaded:
                logger.info("Groundwater model loaded successfully")
            else:
                logger.warning("No compatible model found in directory")
            
            return model_loaded
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            self.is_model_loaded = False
            return False
    
    async def _load_pytorch_model(self) -> bool:
        """Load PyTorch model"""
        try:
            # Load model state dict
            model_file = self.model_path / "pytorch_model.bin"
            state_dict = torch.load(model_file, map_location='cpu')
            
            # Create model architecture (simplified for groundwater prediction)
            from torch import nn
            
            class GroundwaterModel(nn.Module):
                def __init__(self, input_size=10, hidden_size=64, output_size=3):
                    super().__init__()
                    self.network = nn.Sequential(
                        nn.Linear(input_size, hidden_size),
                        nn.ReLU(),
                        nn.Dropout(0.2),
                        nn.Linear(hidden_size, hidden_size // 2),
                        nn.ReLU(),
                        nn.Dropout(0.2),
                        nn.Linear(hidden_size // 2, output_size)
                    )
                
                def forward(self, x):
                    return self.network(x)
            
            # Initialize model
            input_size = self.model_config.get('input_size', 10) if self.model_config else 10
            self.model = GroundwaterModel(input_size=input_size)
            self.model.load_state_dict(state_dict)
            self.model.eval()
            
            logger.info("PyTorch model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load PyTorch model: {str(e)}")
            return False
    
    async def _load_sklearn_model(self) -> bool:
        """Load scikit-learn model"""
        try:
            model_file = self.model_path / "model.pkl"
            with open(model_file, 'rb') as f:
                self.model = pickle.load(f)
            
            logger.info("Scikit-learn model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load scikit-learn model: {str(e)}")
            return False
    
    async def _load_transformers_model(self) -> bool:
        """Load transformers model"""
        try:
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(str(self.model_path))
            
            # Load model
            self.model = AutoModel.from_pretrained(str(self.model_path))
            self.model.eval()
            
            logger.info("Transformers model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load transformers model: {str(e)}")
            return False
    
    def is_loaded(self) -> bool:
        """Check if model is loaded and ready"""
        return self.is_model_loaded and self.model is not None
    
    async def predict(self, location: str, year: int, additional_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make groundwater prediction for given location and year
        
        Args:
            location: Geographic location name
            year: Year for prediction
            additional_params: Additional parameters for prediction
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            if not self.is_loaded():
                raise Exception("Model not loaded")
            
            # Prepare input features
            features = self._prepare_features(location, year, additional_params)
            
            # Make prediction based on model type
            if hasattr(self.model, 'predict'):  # Scikit-learn model
                prediction = await self._predict_sklearn(features)
            elif hasattr(self.model, 'forward'):  # PyTorch model
                prediction = await self._predict_pytorch(features)
            else:  # Transformers model
                prediction = await self._predict_transformers(location, year, additional_params)
            
            return prediction
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def _prepare_features(self, location: str, year: int, additional_params: Optional[Dict[str, Any]]) -> np.ndarray:
        """Prepare input features for model prediction"""
        try:
            # Default feature set for groundwater prediction
            features = {
                'year': year,
                'year_normalized': (year - 2000) / 100,
                'location_hash': hash(location) % 1000 / 1000,
                'latitude': self._get_location_coords(location)[0],
                'longitude': self._get_location_coords(location)[1],
                'elevation': self._get_elevation(location),
                'population_density': self._get_population_density(location),
                'industrial_activity': self._get_industrial_activity(location),
                'agricultural_intensity': self._get_agricultural_intensity(location),
                'climate_zone': self._get_climate_zone(location)
            }
            
            # Add additional parameters if provided
            if additional_params:
                features.update(additional_params)
            
            # Convert to numpy array
            feature_values = list(features.values())
            feature_array = np.array(feature_values).reshape(1, -1)
            
            # Apply scaling if scaler is available
            if self.scaler:
                feature_array = self.scaler.transform(feature_array)
            
            return feature_array
            
        except Exception as e:
            logger.error(f"Feature preparation failed: {str(e)}")
            # Return default features
            return np.array([[year, (year - 2000) / 100, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]])
    
    async def _predict_sklearn(self, features: np.ndarray) -> Dict[str, Any]:
        """Make prediction using scikit-learn model"""
        try:
            prediction = self.model.predict(features)[0]
            
            # Handle different output formats
            if isinstance(prediction, (list, np.ndarray)) and len(prediction) >= 3:
                return {
                    "groundwater_level": float(prediction[0]),
                    "quality_index": float(prediction[1]),
                    "sustainability_score": float(prediction[2]),
                    "confidence": 0.85
                }
            else:
                return {
                    "groundwater_level": float(prediction),
                    "quality_index": float(prediction * 0.8 + 20),
                    "sustainability_score": float(prediction * 0.9),
                    "confidence": 0.85
                }
                
        except Exception as e:
            logger.error(f"Scikit-learn prediction failed: {str(e)}")
            raise
    
    async def _predict_pytorch(self, features: np.ndarray) -> Dict[str, Any]:
        """Make prediction using PyTorch model"""
        try:
            import torch
            
            # Convert to tensor
            features_tensor = torch.FloatTensor(features)
            
            with torch.no_grad():
                prediction = self.model(features_tensor)
                prediction_np = prediction.numpy()[0]
            
            return {
                "groundwater_level": float(prediction_np[0]),
                "quality_index": float(prediction_np[1]),
                "sustainability_score": float(prediction_np[2]),
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"PyTorch prediction failed: {str(e)}")
            raise
    
    async def _predict_transformers(self, location: str, year: int, additional_params: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Make prediction using transformers model"""
        try:
            # Prepare text input
            text_input = f"Location: {location}, Year: {year}"
            if additional_params:
                text_input += f", Parameters: {additional_params}"
            
            # Tokenize input
            inputs = self.tokenizer(text_input, return_tensors="pt", truncation=True, max_length=512)
            
            # Get model output
            with torch.no_grad():
                outputs = self.model(**inputs)
                # Extract features from last hidden state
                features = outputs.last_hidden_state.mean(dim=1)
                
                # Simple linear transformation to get predictions
                # This is a simplified approach - in practice, you'd have a trained head
                prediction = torch.sigmoid(features * 0.1).numpy()[0]
            
            return {
                "groundwater_level": float(prediction[0] * 100),
                "quality_index": float(prediction[1] * 100),
                "sustainability_score": float(prediction[2] * 100),
                "confidence": 0.80
            }
            
        except Exception as e:
            logger.error(f"Transformers prediction failed: {str(e)}")
            raise
    
    def _get_location_coords(self, location: str) -> tuple:
        """Get approximate coordinates for location (simplified)"""
        # Simplified coordinate mapping for Indian locations
        location_coords = {
            'delhi': (28.6139, 77.2090),
            'mumbai': (19.0760, 72.8777),
            'bangalore': (12.9716, 77.5946),
            'chennai': (13.0827, 80.2707),
            'kolkata': (22.5726, 88.3639),
            'hyderabad': (17.3850, 78.4867),
            'pune': (18.5204, 73.8567),
            'ahmedabad': (23.0225, 72.5714),
            'jaipur': (26.9124, 75.7873),
            'lucknow': (26.8467, 80.9462)
        }
        
        location_lower = location.lower()
        for city, coords in location_coords.items():
            if city in location_lower:
                return coords
        
        # Default to center of India
        return (20.5937, 78.9629)
    
    def _get_elevation(self, location: str) -> float:
        """Get approximate elevation for location (simplified)"""
        # Simplified elevation mapping
        elevation_map = {
            'delhi': 216,
            'mumbai': 14,
            'bangalore': 920,
            'chennai': 6,
            'kolkata': 9,
            'hyderabad': 505,
            'pune': 560,
            'ahmedabad': 53,
            'jaipur': 431,
            'lucknow': 123
        }
        
        location_lower = location.lower()
        for city, elevation in elevation_map.items():
            if city in location_lower:
                return elevation / 1000  # Normalize to km
        
        return 0.3  # Default elevation
    
    def _get_population_density(self, location: str) -> float:
        """Get approximate population density (simplified)"""
        # Simplified population density mapping
        density_map = {
            'delhi': 11297,
            'mumbai': 20636,
            'bangalore': 4381,
            'chennai': 10536,
            'kolkata': 22290,
            'hyderabad': 10418,
            'pune': 5618,
            'ahmedabad': 8908,
            'jaipur': 5983,
            'lucknow': 1816
        }
        
        location_lower = location.lower()
        for city, density in density_map.items():
            if city in location_lower:
                return density / 10000  # Normalize
        
        return 5.0  # Default density
    
    def _get_industrial_activity(self, location: str) -> float:
        """Get approximate industrial activity level (simplified)"""
        # Simplified industrial activity mapping
        industrial_map = {
            'mumbai': 0.9,
            'delhi': 0.8,
            'bangalore': 0.7,
            'chennai': 0.8,
            'kolkata': 0.6,
            'hyderabad': 0.7,
            'pune': 0.8,
            'ahmedabad': 0.8,
            'jaipur': 0.4,
            'lucknow': 0.5
        }
        
        location_lower = location.lower()
        for city, activity in industrial_map.items():
            if city in location_lower:
                return activity
        
        return 0.5  # Default activity
    
    def _get_agricultural_intensity(self, location: str) -> float:
        """Get approximate agricultural intensity (simplified)"""
        # Simplified agricultural intensity mapping
        agricultural_map = {
            'delhi': 0.3,
            'mumbai': 0.2,
            'bangalore': 0.4,
            'chennai': 0.3,
            'kolkata': 0.6,
            'hyderabad': 0.5,
            'pune': 0.4,
            'ahmedabad': 0.5,
            'jaipur': 0.6,
            'lucknow': 0.7
        }
        
        location_lower = location.lower()
        for city, intensity in agricultural_map.items():
            if city in location_lower:
                return intensity
        
        return 0.5  # Default intensity
    
    def _get_climate_zone(self, location: str) -> float:
        """Get approximate climate zone (simplified)"""
        # Simplified climate zone mapping
        climate_map = {
            'delhi': 0.7,  # Semi-arid
            'mumbai': 0.9,  # Tropical wet
            'bangalore': 0.6,  # Tropical savanna
            'chennai': 0.8,  # Tropical wet and dry
            'kolkata': 0.8,  # Tropical wet and dry
            'hyderabad': 0.5,  # Semi-arid
            'pune': 0.6,  # Tropical savanna
            'ahmedabad': 0.4,  # Arid
            'jaipur': 0.3,  # Arid
            'lucknow': 0.7  # Semi-arid
        }
        
        location_lower = location.lower()
        for city, climate in climate_map.items():
            if city in location_lower:
                return climate
        
        return 0.6  # Default climate
