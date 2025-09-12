"""
Pydantic schemas for health check endpoints
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class HealthResponse(BaseModel):
    """Response schema for health check"""
    status: str = Field(..., description="Overall health status")
    timestamp: datetime = Field(..., description="Health check timestamp")
    version: str = Field(..., description="API version")
    services: Dict[str, str] = Field(..., description="Status of individual services")
    message: Optional[str] = Field(None, description="Additional status message")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
