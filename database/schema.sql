-- INGRES AI ChatBot Database Schema
-- PostgreSQL database schema for groundwater data management

-- Create database (run this separately if needed)
-- CREATE DATABASE ingres_groundwater;

-- Connect to the database
-- \c ingres_groundwater;

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create groundwater_data table for historical groundwater information
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
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    elevation_m DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location, year)
);

-- Create prediction_logs table for monitoring and analytics
CREATE TABLE IF NOT EXISTS prediction_logs (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    prediction_data JSONB,
    model_used VARCHAR(100),
    confidence DECIMAL(5,2),
    response_time_ms INTEGER,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table for standardized location data
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    elevation_m DECIMAL(10,2),
    population INTEGER,
    area_km2 DECIMAL(10,2),
    climate_zone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create model_performance table for tracking model accuracy
CREATE TABLE IF NOT EXISTS model_performance (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    year INTEGER,
    actual_value DECIMAL(10,2),
    predicted_value DECIMAL(10,2),
    error DECIMAL(10,2),
    absolute_error DECIMAL(10,2),
    squared_error DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address INET,
    language VARCHAR(10) DEFAULT 'en',
    model_preference VARCHAR(50) DEFAULT 'custom_trained',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groundwater_location_year ON groundwater_data(location, year);
CREATE INDEX IF NOT EXISTS idx_groundwater_year ON groundwater_data(year);
CREATE INDEX IF NOT EXISTS idx_groundwater_location ON groundwater_data(location);

CREATE INDEX IF NOT EXISTS idx_prediction_logs_location_year ON prediction_logs(location, year);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_created_at ON prediction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_model_used ON prediction_logs(model_used);

CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_state ON locations(state);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_model_performance_model ON model_performance(model_name);
CREATE INDEX IF NOT EXISTS idx_model_performance_location ON model_performance(location);
CREATE INDEX IF NOT EXISTS idx_model_performance_created_at ON model_performance(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create spatial index for geographic queries
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(ST_Point(longitude, latitude));

-- Insert sample location data
INSERT INTO locations (name, state, latitude, longitude, elevation_m, population, climate_zone) VALUES
('Delhi', 'Delhi', 28.6139, 77.2090, 216, 32941000, 'Semi-arid'),
('Mumbai', 'Maharashtra', 19.0760, 72.8777, 14, 12478000, 'Tropical wet'),
('Bangalore', 'Karnataka', 12.9716, 77.5946, 920, 8443000, 'Tropical savanna'),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707, 6, 7090000, 'Tropical wet and dry'),
('Kolkata', 'West Bengal', 22.5726, 88.3639, 9, 14974000, 'Tropical wet and dry'),
('Hyderabad', 'Telangana', 17.3850, 78.4867, 505, 6993000, 'Semi-arid'),
('Pune', 'Maharashtra', 18.5204, 73.8567, 560, 3124000, 'Tropical savanna'),
('Ahmedabad', 'Gujarat', 23.0225, 72.5714, 53, 5570000, 'Arid'),
('Jaipur', 'Rajasthan', 26.9124, 75.7873, 431, 3073000, 'Arid'),
('Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 123, 2817000, 'Semi-arid')
ON CONFLICT (name) DO NOTHING;

-- Insert sample groundwater data
INSERT INTO groundwater_data (location, year, groundwater_level, quality_index, sustainability_score, rainfall_mm, temperature_c, population_density, industrial_activity, agricultural_intensity, latitude, longitude, elevation_m) VALUES
-- Delhi data
('Delhi', 2020, 45.2, 56.4, 40.7, 650.5, 28.5, 11.3, 0.8, 0.3, 28.6139, 77.2090, 216),
('Delhi', 2021, 43.8, 54.1, 39.4, 720.3, 29.1, 11.5, 0.8, 0.3, 28.6139, 77.2090, 216),
('Delhi', 2022, 42.1, 52.8, 37.9, 680.7, 28.8, 11.7, 0.8, 0.3, 28.6139, 77.2090, 216),
('Delhi', 2023, 40.5, 51.2, 36.5, 750.2, 29.3, 11.9, 0.8, 0.3, 28.6139, 77.2090, 216),
('Delhi', 2024, 38.9, 49.6, 35.0, 690.8, 29.0, 12.1, 0.8, 0.3, 28.6139, 77.2090, 216),

-- Mumbai data
('Mumbai', 2020, 52.3, 61.8, 47.1, 2200.5, 27.2, 20.6, 0.9, 0.2, 19.0760, 72.8777, 14),
('Mumbai', 2021, 51.7, 60.9, 46.5, 2100.3, 27.5, 20.8, 0.9, 0.2, 19.0760, 72.8777, 14),
('Mumbai', 2022, 50.8, 59.7, 45.7, 2300.7, 27.1, 21.0, 0.9, 0.2, 19.0760, 72.8777, 14),
('Mumbai', 2023, 49.9, 58.4, 44.9, 2150.2, 27.8, 21.2, 0.9, 0.2, 19.0760, 72.8777, 14),
('Mumbai', 2024, 48.7, 57.0, 43.8, 2250.8, 27.4, 21.4, 0.9, 0.2, 19.0760, 72.8777, 14),

-- Bangalore data
('Bangalore', 2020, 48.6, 58.9, 43.7, 970.5, 24.8, 4.4, 0.7, 0.4, 12.9716, 77.5946, 920),
('Bangalore', 2021, 47.2, 57.8, 42.5, 1050.3, 25.1, 4.5, 0.7, 0.4, 12.9716, 77.5946, 920),
('Bangalore', 2022, 45.8, 56.6, 41.2, 920.7, 24.9, 4.6, 0.7, 0.4, 12.9716, 77.5946, 920),
('Bangalore', 2023, 44.3, 55.4, 39.9, 1100.2, 25.3, 4.7, 0.7, 0.4, 12.9716, 77.5946, 920),
('Bangalore', 2024, 42.7, 54.2, 38.4, 980.8, 25.0, 4.8, 0.7, 0.4, 12.9716, 77.5946, 920)
ON CONFLICT (location, year) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW groundwater_summary AS
SELECT 
    location,
    COUNT(*) as data_points,
    MIN(year) as earliest_year,
    MAX(year) as latest_year,
    AVG(groundwater_level) as avg_groundwater_level,
    AVG(quality_index) as avg_quality_index,
    AVG(sustainability_score) as avg_sustainability_score,
    AVG(rainfall_mm) as avg_rainfall,
    AVG(temperature_c) as avg_temperature
FROM groundwater_data
GROUP BY location;

CREATE OR REPLACE VIEW recent_predictions AS
SELECT 
    location,
    year,
    model_used,
    confidence,
    (prediction_data->>'groundwater_level')::DECIMAL as predicted_level,
    created_at
FROM prediction_logs
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Create functions for data analysis
CREATE OR REPLACE FUNCTION get_groundwater_trend(location_name VARCHAR, years_back INTEGER DEFAULT 5)
RETURNS TABLE (
    year INTEGER,
    groundwater_level DECIMAL,
    quality_index DECIMAL,
    sustainability_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gd.year,
        gd.groundwater_level,
        gd.quality_index,
        gd.sustainability_score
    FROM groundwater_data gd
    WHERE gd.location = location_name
    AND gd.year >= EXTRACT(YEAR FROM CURRENT_DATE) - years_back
    ORDER BY gd.year;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate groundwater trend
CREATE OR REPLACE FUNCTION calculate_groundwater_trend(location_name VARCHAR, years_back INTEGER DEFAULT 5)
RETURNS DECIMAL AS $$
DECLARE
    trend DECIMAL;
    first_year_level DECIMAL;
    last_year_level DECIMAL;
BEGIN
    SELECT groundwater_level INTO first_year_level
    FROM groundwater_data
    WHERE location = location_name
    AND year = EXTRACT(YEAR FROM CURRENT_DATE) - years_back
    LIMIT 1;
    
    SELECT groundwater_level INTO last_year_level
    FROM groundwater_data
    WHERE location = location_name
    AND year = EXTRACT(YEAR FROM CURRENT_DATE) - 1
    LIMIT 1;
    
    IF first_year_level IS NOT NULL AND last_year_level IS NOT NULL THEN
        trend := last_year_level - first_year_level;
    ELSE
        trend := 0;
    END IF;
    
    RETURN trend;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ingres_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ingres_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ingres_user;
