"""
INGRES AI ChatBot - Main FastAPI Backend
Serves groundwater prediction endpoints and manages model inference
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import asyncio
from contextlib import asynccontextmanager

from models.groundwater_model import GroundwaterModelManager
from models.database import DatabaseManager
from schemas.prediction import PredictionRequest, PredictionResponse, HistoryRequest, HistoryResponse
from schemas.health import HealthResponse
from utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

# Global model manager
model_manager = None
db_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown"""
    global model_manager, db_manager
    
    # Startup
    logger.info("Starting INGRES AI ChatBot Backend...")
    
    try:
        # Initialize database manager
        db_manager = DatabaseManager()
        await db_manager.initialize()
        logger.info("Database connection established")
        
        # Initialize model manager
        model_manager = GroundwaterModelManager()
        await model_manager.load_model()
        logger.info("Groundwater model loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        # Continue with fallback mode
        model_manager = None
        db_manager = None
    
    yield
    
    # Shutdown
    logger.info("Shutting down INGRES AI ChatBot Backend...")
    if db_manager:
        await db_manager.close()

# Create FastAPI app
app = FastAPI(
    title="INGRES AI ChatBot API",
    description="Groundwater prediction and analysis API with custom trained models",
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

# Dependency to get database manager
async def get_db_manager() -> Optional[DatabaseManager]:
    """Dependency to get the database manager instance"""
    return db_manager

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "INGRES AI ChatBot API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "predict": "/predict",
            "history": "/history", 
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_groundwater(
    request: PredictionRequest,
    background_tasks: BackgroundTasks,
    model_mgr: Optional[GroundwaterModelManager] = Depends(get_model_manager)
):
    """
    Predict groundwater content for a given location and year
    """
    try:
        logger.info(f"Prediction request for location: {request.location}, year: {request.year}")
        
        # Validate input
        if not request.location or not request.location.strip():
            raise HTTPException(status_code=400, detail="Location is required")
        
        if request.year < 1900 or request.year > 2100:
            raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
        
        # Get prediction from model
        if model_mgr and model_mgr.is_loaded():
            try:
                prediction_result = await model_mgr.predict(
                    location=request.location,
                    year=request.year,
                    additional_params=request.additional_params
                )
                
                # Log prediction for monitoring
                background_tasks.add_task(
                    log_prediction,
                    request.location,
                    request.year,
                    prediction_result
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
                logger.warning(f"Model prediction failed: {str(model_error)}")
                # Fallback to static response
                return get_fallback_prediction(request)
        else:
            logger.warning("Model not available, using fallback prediction")
            return get_fallback_prediction(request)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

@app.post("/history", response_model=HistoryResponse)
async def get_groundwater_history(
    request: HistoryRequest,
    db_mgr: Optional[DatabaseManager] = Depends(get_db_manager)
):
    """
    Get historical groundwater assessment data for a location
    """
    try:
        logger.info(f"History request for location: {request.location}")
        
        if not request.location or not request.location.strip():
            raise HTTPException(status_code=400, detail="Location is required")
        
        # Get historical data from database
        if db_mgr:
            try:
                historical_data = await db_mgr.get_groundwater_history(
                    location=request.location,
                    start_year=request.start_year,
                    end_year=request.end_year
                )
                
                return HistoryResponse(
                    location=request.location,
                    data=historical_data,
                    start_year=request.start_year,
                    end_year=request.end_year,
                    success=True,
                    timestamp=datetime.utcnow()
                )
                
            except Exception as db_error:
                logger.warning(f"Database query failed: {str(db_error)}")
                # Fallback to mock data
                return get_fallback_history(request)
        else:
            logger.warning("Database not available, using fallback history")
            return get_fallback_history(request)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"History retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during history retrieval")

@app.get("/health", response_model=HealthResponse)
async def health_check(
    model_mgr: Optional[GroundwaterModelManager] = Depends(get_model_manager),
    db_mgr: Optional[DatabaseManager] = Depends(get_db_manager)
):
    """
    Health check endpoint for monitoring
    """
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "version": "1.0.0",
            "services": {
                "model": "available" if model_mgr and model_mgr.is_loaded() else "unavailable",
                "database": "available" if db_mgr else "unavailable",
                "api": "available"
            }
        }
        
        # Determine overall health
        if not model_mgr or not model_mgr.is_loaded():
            health_status["status"] = "degraded"
            health_status["message"] = "Model service unavailable, using fallback mode"
        
        if not db_mgr:
            health_status["status"] = "degraded" 
            health_status["message"] = "Database service unavailable, using fallback mode"
        
        return HealthResponse(**health_status)
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return HealthResponse(
            status="unhealthy",
            timestamp=datetime.utcnow(),
            version="1.0.0",
            services={"api": "error"},
            message=f"Health check failed: {str(e)}"
        )

def get_fallback_prediction(request: PredictionRequest) -> PredictionResponse:
    """Generate fallback prediction when model is unavailable"""
    # Simple heuristic-based fallback
    base_level = 50.0
    year_factor = (request.year - 2000) * 0.1
    location_factor = hash(request.location) % 20 - 10
    
    predicted_level = max(0, min(100, base_level + year_factor + location_factor))
    
    return PredictionResponse(
        location=request.location,
        year=request.year,
        prediction={
            "groundwater_level": round(predicted_level, 2),
            "quality_index": round(predicted_level * 0.8 + 20, 2),
            "sustainability_score": round(predicted_level * 0.9, 2),
            "confidence": 0.6,
            "note": "Fallback prediction - model unavailable"
        },
        model_used="fallback_heuristic",
        confidence=0.6,
        timestamp=datetime.utcnow(),
        success=True
    )

def get_fallback_history(request: HistoryRequest) -> HistoryResponse:
    """Generate fallback historical data when database is unavailable"""
    import random
    
    years = list(range(request.start_year, request.end_year + 1))
    historical_data = []
    
    for year in years:
        base_level = 50 + (year - 2000) * 0.5
        variation = random.uniform(-10, 10)
        level = max(0, min(100, base_level + variation))
        
        historical_data.append({
            "year": year,
            "groundwater_level": round(level, 2),
            "quality_index": round(level * 0.8 + 20, 2),
            "rainfall_mm": round(random.uniform(800, 1200), 1),
            "temperature_c": round(random.uniform(25, 35), 1)
        })
    
    return HistoryResponse(
        location=request.location,
        data=historical_data,
        start_year=request.start_year,
        end_year=request.end_year,
        success=True,
        timestamp=datetime.utcnow()
    )

async def log_prediction(location: str, year: int, prediction: Dict[str, Any]):
    """Background task to log prediction for monitoring"""
    try:
        if db_mgr:
            await db_mgr.log_prediction(location, year, prediction)
    except Exception as e:
        logger.warning(f"Failed to log prediction: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
