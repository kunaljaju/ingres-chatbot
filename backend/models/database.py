"""
Database Manager for INGRES AI ChatBot
Handles PostgreSQL database operations for groundwater data
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncpg
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import pandas as pd

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages database connections and operations"""
    
    def __init__(self):
        self.engine = None
        self.async_session = None
        self.connection_string = self._get_connection_string()
        
    def _get_connection_string(self) -> str:
        """Get database connection string from environment variables"""
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "5432")
        database = os.getenv("DB_NAME", "ingres_groundwater")
        username = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASSWORD", "password")
        
        return f"postgresql+asyncpg://{username}:{password}@{host}:{port}/{database}"
    
    async def initialize(self):
        """Initialize database connection"""
        try:
            logger.info("Initializing database connection...")
            
            # Create async engine
            self.engine = create_async_engine(
                self.connection_string,
                echo=False,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True
            )
            
            # Create session factory
            self.async_session = sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Test connection
            async with self.engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            
            logger.info("Database connection established successfully")
            
            # Initialize tables if they don't exist
            await self._initialize_tables()
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise
    
    async def _initialize_tables(self):
        """Initialize database tables if they don't exist"""
        try:
            async with self.engine.begin() as conn:
                # Create groundwater_data table
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS groundwater_data (
                        id SERIAL PRIMARY KEY,
                        location VARCHAR(255) NOT NULL,
                        year INTEGER NOT NULL,
                        groundwater_level DECIMAL(10,2),
                        quality_index DECIMAL(10,2),
                        sustainability_score DECIMAL(10,2),
                        rainfall_mm DECIMAL(10,2),
                        temperature_c DECIMAL(10,2),
                        population_density DECIMAL(10,2),
                        industrial_activity DECIMAL(10,2),
                        agricultural_intensity DECIMAL(10,2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(location, year)
                    )
                """))
                
                # Create prediction_logs table
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS prediction_logs (
                        id SERIAL PRIMARY KEY,
                        location VARCHAR(255) NOT NULL,
                        year INTEGER NOT NULL,
                        prediction_data JSONB,
                        model_used VARCHAR(100),
                        confidence DECIMAL(5,2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                # Create indexes
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_groundwater_location_year 
                    ON groundwater_data(location, year)
                """))
                
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_prediction_logs_location_year 
                    ON prediction_logs(location, year)
                """))
                
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_prediction_logs_created_at 
                    ON prediction_logs(created_at)
                """))
            
            logger.info("Database tables initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize tables: {str(e)}")
            raise
    
    async def get_groundwater_history(
        self, 
        location: str, 
        start_year: int = 2000, 
        end_year: int = 2024
    ) -> List[Dict[str, Any]]:
        """Get historical groundwater data for a location"""
        try:
            async with self.async_session() as session:
                result = await session.execute(text("""
                    SELECT 
                        year,
                        groundwater_level,
                        quality_index,
                        sustainability_score,
                        rainfall_mm,
                        temperature_c,
                        population_density,
                        industrial_activity,
                        agricultural_intensity
                    FROM groundwater_data 
                    WHERE location = :location 
                    AND year BETWEEN :start_year AND :end_year
                    ORDER BY year ASC
                """), {
                    "location": location,
                    "start_year": start_year,
                    "end_year": end_year
                })
                
                rows = result.fetchall()
                
                # Convert to list of dictionaries
                historical_data = []
                for row in rows:
                    historical_data.append({
                        "year": row.year,
                        "groundwater_level": float(row.groundwater_level) if row.groundwater_level else None,
                        "quality_index": float(row.quality_index) if row.quality_index else None,
                        "sustainability_score": float(row.sustainability_score) if row.sustainability_score else None,
                        "rainfall_mm": float(row.rainfall_mm) if row.rainfall_mm else None,
                        "temperature_c": float(row.temperature_c) if row.temperature_c else None,
                        "population_density": float(row.population_density) if row.population_density else None,
                        "industrial_activity": float(row.industrial_activity) if row.industrial_activity else None,
                        "agricultural_intensity": float(row.agricultural_intensity) if row.agricultural_intensity else None
                    })
                
                return historical_data
                
        except Exception as e:
            logger.error(f"Failed to get groundwater history: {str(e)}")
            raise
    
    async def log_prediction(
        self, 
        location: str, 
        year: int, 
        prediction_data: Dict[str, Any]
    ):
        """Log prediction for monitoring and analysis"""
        try:
            async with self.async_session() as session:
                await session.execute(text("""
                    INSERT INTO prediction_logs (location, year, prediction_data, model_used, confidence)
                    VALUES (:location, :year, :prediction_data, :model_used, :confidence)
                """), {
                    "location": location,
                    "year": year,
                    "prediction_data": str(prediction_data),
                    "model_used": prediction_data.get("model_used", "custom_trained"),
                    "confidence": prediction_data.get("confidence", 0.85)
                })
                
                await session.commit()
                
        except Exception as e:
            logger.error(f"Failed to log prediction: {str(e)}")
            # Don't raise exception for logging failures
    
    async def insert_groundwater_data(
        self, 
        location: str, 
        year: int, 
        data: Dict[str, Any]
    ):
        """Insert or update groundwater data"""
        try:
            async with self.async_session() as session:
                await session.execute(text("""
                    INSERT INTO groundwater_data (
                        location, year, groundwater_level, quality_index, 
                        sustainability_score, rainfall_mm, temperature_c,
                        population_density, industrial_activity, agricultural_intensity
                    ) VALUES (
                        :location, :year, :groundwater_level, :quality_index,
                        :sustainability_score, :rainfall_mm, :temperature_c,
                        :population_density, :industrial_activity, :agricultural_intensity
                    )
                    ON CONFLICT (location, year) 
                    DO UPDATE SET
                        groundwater_level = EXCLUDED.groundwater_level,
                        quality_index = EXCLUDED.quality_index,
                        sustainability_score = EXCLUDED.sustainability_score,
                        rainfall_mm = EXCLUDED.rainfall_mm,
                        temperature_c = EXCLUDED.temperature_c,
                        population_density = EXCLUDED.population_density,
                        industrial_activity = EXCLUDED.industrial_activity,
                        agricultural_intensity = EXCLUDED.agricultural_intensity,
                        updated_at = CURRENT_TIMESTAMP
                """), {
                    "location": location,
                    "year": year,
                    "groundwater_level": data.get("groundwater_level"),
                    "quality_index": data.get("quality_index"),
                    "sustainability_score": data.get("sustainability_score"),
                    "rainfall_mm": data.get("rainfall_mm"),
                    "temperature_c": data.get("temperature_c"),
                    "population_density": data.get("population_density"),
                    "industrial_activity": data.get("industrial_activity"),
                    "agricultural_intensity": data.get("agricultural_intensity")
                })
                
                await session.commit()
                
        except Exception as e:
            logger.error(f"Failed to insert groundwater data: {str(e)}")
            raise
    
    async def get_prediction_stats(self, days: int = 30) -> Dict[str, Any]:
        """Get prediction statistics for monitoring"""
        try:
            async with self.async_session() as session:
                # Get prediction count
                result = await session.execute(text("""
                    SELECT COUNT(*) as total_predictions
                    FROM prediction_logs 
                    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '%s days'
                """ % days))
                
                total_predictions = result.fetchone().total_predictions
                
                # Get model usage stats
                result = await session.execute(text("""
                    SELECT model_used, COUNT(*) as count
                    FROM prediction_logs 
                    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '%s days'
                    GROUP BY model_used
                """ % days))
                
                model_stats = {row.model_used: row.count for row in result.fetchall()}
                
                # Get average confidence
                result = await session.execute(text("""
                    SELECT AVG(confidence) as avg_confidence
                    FROM prediction_logs 
                    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '%s days'
                """ % days))
                
                avg_confidence = result.fetchone().avg_confidence or 0
                
                return {
                    "total_predictions": total_predictions,
                    "model_usage": model_stats,
                    "average_confidence": float(avg_confidence),
                    "period_days": days
                }
                
        except Exception as e:
            logger.error(f"Failed to get prediction stats: {str(e)}")
            return {
                "total_predictions": 0,
                "model_usage": {},
                "average_confidence": 0.0,
                "period_days": days
            }
    
    async def seed_sample_data(self):
        """Seed database with sample groundwater data"""
        try:
            logger.info("Seeding database with sample data...")
            
            # Sample locations
            locations = [
                "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata",
                "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
            ]
            
            # Generate sample data for each location
            for location in locations:
                for year in range(2000, 2025):
                    # Generate realistic sample data
                    base_level = 50 + (year - 2000) * 0.5
                    variation = hash(f"{location}{year}") % 20 - 10
                    groundwater_level = max(0, min(100, base_level + variation))
                    
                    sample_data = {
                        "groundwater_level": groundwater_level,
                        "quality_index": groundwater_level * 0.8 + 20,
                        "sustainability_score": groundwater_level * 0.9,
                        "rainfall_mm": 800 + (hash(f"{location}{year}") % 400),
                        "temperature_c": 25 + (hash(f"{location}{year}") % 10),
                        "population_density": 5 + (hash(f"{location}{year}") % 10),
                        "industrial_activity": 0.3 + (hash(f"{location}{year}") % 50) / 100,
                        "agricultural_intensity": 0.4 + (hash(f"{location}{year}") % 40) / 100
                    }
                    
                    await self.insert_groundwater_data(location, year, sample_data)
            
            logger.info("Sample data seeded successfully")
            
        except Exception as e:
            logger.error(f"Failed to seed sample data: {str(e)}")
    
    async def close(self):
        """Close database connections"""
        try:
            if self.engine:
                await self.engine.dispose()
                logger.info("Database connections closed")
        except Exception as e:
            logger.error(f"Error closing database connections: {str(e)}")
