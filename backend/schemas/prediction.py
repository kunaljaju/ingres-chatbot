"""
Pydantic schemas for prediction endpoints
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional, List
from datetime import datetime

class PredictionRequest(BaseModel):
    """Request schema for groundwater prediction"""
    location: str = Field(..., description="Geographic location name", min_length=1, max_length=255)
    year: int = Field(..., description="Year for prediction", ge=1900, le=2100)
    additional_params: Optional[Dict[str, Any]] = Field(None, description="Additional parameters for prediction")
    
    @validator('location')
    def validate_location(cls, v):
        if not v or not v.strip():
            raise ValueError('Location cannot be empty')
        return v.strip()
    
    @validator('year')
    def validate_year(cls, v):
        if v < 1900 or v > 2100:
            raise ValueError('Year must be between 1900 and 2100')
        return v

class PredictionResponse(BaseModel):
    """Response schema for groundwater prediction"""
    location: str = Field(..., description="Geographic location name")
    year: int = Field(..., description="Year for prediction")
    prediction: Dict[str, Any] = Field(..., description="Prediction results")
    model_used: str = Field(..., description="Model used for prediction")
    confidence: float = Field(..., description="Confidence score", ge=0.0, le=1.0)
    timestamp: datetime = Field(..., description="Prediction timestamp")
    success: bool = Field(..., description="Whether prediction was successful")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class HistoryRequest(BaseModel):
    """Request schema for historical data"""
    location: str = Field(..., description="Geographic location name", min_length=1, max_length=255)
    start_year: int = Field(2000, description="Start year for historical data", ge=1900, le=2100)
    end_year: int = Field(2024, description="End year for historical data", ge=1900, le=2100)
    
    @validator('location')
    def validate_location(cls, v):
        if not v or not v.strip():
            raise ValueError('Location cannot be empty')
        return v.strip()
    
    @validator('end_year')
    def validate_year_range(cls, v, values):
        if 'start_year' in values and v < values['start_year']:
            raise ValueError('End year must be greater than or equal to start year')
        return v

class HistoryDataPoint(BaseModel):
    """Schema for individual historical data point"""
    year: int = Field(..., description="Year of the data point")
    groundwater_level: Optional[float] = Field(None, description="Groundwater level")
    quality_index: Optional[float] = Field(None, description="Water quality index")
    sustainability_score: Optional[float] = Field(None, description="Sustainability score")
    rainfall_mm: Optional[float] = Field(None, description="Rainfall in millimeters")
    temperature_c: Optional[float] = Field(None, description="Temperature in Celsius")
    population_density: Optional[float] = Field(None, description="Population density")
    industrial_activity: Optional[float] = Field(None, description="Industrial activity level")
    agricultural_intensity: Optional[float] = Field(None, description="Agricultural intensity")

class HistoryResponse(BaseModel):
    """Response schema for historical data"""
    location: str = Field(..., description="Geographic location name")
    data: List[HistoryDataPoint] = Field(..., description="Historical data points")
    start_year: int = Field(..., description="Start year of the data")
    end_year: int = Field(..., description="End year of the data")
    success: bool = Field(..., description="Whether data retrieval was successful")
    timestamp: datetime = Field(..., description="Response timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
