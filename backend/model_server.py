"""
Custom Model Server for INGRES AI ChatBot
Dedicated server for loading and serving the trained groundwater model
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional
import asyncio
from contextlib import asynccontextmanager

from models.groundwater_model import GroundwaterModelManager
from schemas.prediction import PredictionRequest, PredictionResponse
from schemas.health import HealthResponse
from utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

# Global model manager
model_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown"""
    global model_manager
    
    # Startup
    logger.info("Starting INGRES Custom Model Server...")
    
    try:
        # Initialize model manager with custom model path
        model_path = os.getenv("MODEL_PATH", "/models/your-trained-model")
        model_manager = GroundwaterModelManager(model_path)
        
        # Load the custom trained model
        success = await model_manager.load_model()
        if success:
            logger.info("Custom groundwater model loaded successfully")
        else:
            logger.warning("Failed to load custom model, server will run in fallback mode")
        
    except Exception as e:
        logger.error(f"Failed to initialize model server: {str(e)}")
        model_manager = None
    
    yield
    
    # Shutdown
    logger.info("Shutting down INGRES Custom Model Server...")

# Create FastAPI app
app = FastAPI(
    title="INGRES Custom Model Server",
    description="Dedicated server for custom trained groundwater prediction model",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get model manager
async def get_model_manager() -> Optional[GroundwaterModelManager]:
    """Dependency to get the model manager instance"""
    return model_manager

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with server information"""
    return {
        "message": "INGRES Custom Model Server",
        "version": "1.0.0",
        "status": "operational",
        "model_loaded": model_manager.is_loaded() if model_manager else False,
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "model_info": "/model-info"
        }
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_groundwater(
    request: PredictionRequest,
    model_mgr: Optional[GroundwaterModelManager] = Depends(get_model_manager)
):
    """
    Predict groundwater content using the custom trained model
    """
    try:
        logger.info(f"Model prediction request for location: {request.location}, year: {request.year}")
        
        # Validate input
        if not request.location or not request.location.strip():
            raise HTTPException(status_code=400, detail="Location is required")
        
        if request.year < 1900 or request.year > 2100:
            raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
        
        # Get prediction from custom model
        if model_mgr and model_mgr.is_loaded():
            try:
                prediction_result = await model_mgr.predict(
                    location=request.location,
                    year=request.year,
                    additional_params=request.additional_params
                )
                
                return PredictionResponse(
                    location=request.location,
                    year=request.year,
                    prediction=prediction_result,
                    model_used="custom_trained",
                    confidence=prediction_result.get("confidence", 0.85),
                    timestamp=datetime.utcnow(),
                    success=True
                )
                
            except Exception as model_error:
                logger.error(f"Custom model prediction failed: {str(model_error)}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Model prediction failed: {str(model_error)}"
                )
        else:
            raise HTTPException(
                status_code=503, 
                detail="Custom model not available. Please ensure model files are properly placed in /models/your-trained-model"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

@app.get("/model-info", response_model=Dict[str, Any])
async def get_model_info(
    model_mgr: Optional[GroundwaterModelManager] = Depends(get_model_manager)
):
    """
    Get information about the loaded custom model
    """
    try:
        if not model_mgr:
            return {
                "model_loaded": False,
                "message": "Model manager not initialized"
            }
        
        if not model_mgr.is_loaded():
            return {
                "model_loaded": False,
                "message": "Custom model not loaded",
                "model_path": model_mgr.model_path,
                "suggestion": "Please ensure model files are present in the model directory"
            }
        
        # Get model information
        model_info = {
            "model_loaded": True,
            "model_path": str(model_mgr.model_path),
            "model_type": type(model_mgr.model).__name__ if model_mgr.model else "Unknown",
            "has_scaler": model_mgr.scaler is not None,
            "has_feature_columns": model_mgr.feature_columns is not None,
            "model_config": model_mgr.model_config,
            "loaded_at": datetime.utcnow().isoformat()
        }
        
        return model_info
        
    except Exception as e:
        logger.error(f"Failed to get model info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get model information")

@app.get("/health", response_model=HealthResponse)
async def health_check(
    model_mgr: Optional[GroundwaterModelManager] = Depends(get_model_manager)
):
    """
    Health check endpoint for the model server
    """
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "version": "1.0.0",
            "services": {
                "model_server": "available",
                "custom_model": "available" if model_mgr and model_mgr.is_loaded() else "unavailable"
            }
        }
        
        # Determine overall health
        if not model_mgr or not model_mgr.is_loaded():
            health_status["status"] = "degraded"
            health_status["message"] = "Custom model not loaded - check model files in /models/your-trained-model"
        
        return HealthResponse(**health_status)
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return HealthResponse(
            status="unhealthy",
            timestamp=datetime.utcnow(),
            version="1.0.0",
            services={"model_server": "error"},
            message=f"Health check failed: {str(e)}"
        )

@app.get("/model-files", response_model=Dict[str, Any])
async def list_model_files():
    """
    List available model files in the model directory
    """
    try:
        model_path = os.getenv("MODEL_PATH", "/models/your-trained-model")
        model_dir = os.path.dirname(model_path) if os.path.isfile(model_path) else model_path
        
        if not os.path.exists(model_dir):
            return {
                "model_directory": model_dir,
                "exists": False,
                "message": f"Model directory not found: {model_dir}",
                "files": []
            }
        
        # List files in model directory
        files = []
        for root, dirs, filenames in os.walk(model_dir):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                relative_path = os.path.relpath(file_path, model_dir)
                file_size = os.path.getsize(file_path)
                files.append({
                    "name": filename,
                    "path": relative_path,
                    "size_bytes": file_size,
                    "size_mb": round(file_size / (1024 * 1024), 2)
                })
        
        return {
            "model_directory": model_dir,
            "exists": True,
            "total_files": len(files),
            "files": files
        }
        
    except Exception as e:
        logger.error(f"Failed to list model files: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list model files")

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("MODEL_SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("MODEL_SERVER_PORT", "8001"))
    log_level = os.getenv("LOG_LEVEL", "info")
    
    logger.info(f"Starting model server on {host}:{port}")
    
    uvicorn.run(
        "model_server:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        log_level=log_level
    )
