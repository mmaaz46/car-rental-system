-- =====================================================
-- CAR RENTAL SYSTEM - DATABASE SCHEMA
-- PostgreSQL 14+ Compatible
-- =====================================================

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- Stores customer and admin information
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CARS TABLE
-- Stores vehicle information
-- =====================================================
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2030),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    seats INTEGER NOT NULL CHECK (seats > 0 AND seats <= 50),
    transmission VARCHAR(20) CHECK (transmission IN ('automatic', 'manual')),
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
    price_per_day DECIMAL(10,2) NOT NULL CHECK (price_per_day > 0),
    location VARCHAR(255) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. BOOKINGS TABLE
-- Stores rental reservations
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. PAYMENTS TABLE
-- Stores payment transactions
-- =====================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. REVIEWS TABLE
-- Stores customer reviews for cars
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_review_per_booking UNIQUE (booking_id)
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_category ON cars(category);
CREATE INDEX idx_cars_location ON cars(location);
CREATE INDEX idx_cars_price ON cars(price_per_day);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_car ON bookings(car_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_reviews_car ON reviews(car_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =====================================================
-- HELPER FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
INSERT INTO cars (make, model, year, license_plate, category, color, seats, transmission, fuel_type, price_per_day, location, description, features, images) VALUES
('Toyota', 'Camry', 2023, 'ABC123', 'economy', 'Silver', 5, 'automatic', 'petrol', 45.00, 'New York', 'Reliable sedan perfect for city driving', '["GPS", "Bluetooth", "Backup Camera"]', '["/uploads/cars/camry1.jpg"]'),
('BMW', 'X5', 2023, 'BMW456', 'luxury', 'Black', 5, 'automatic', 'petrol', 120.00, 'New York', 'Luxury SUV with premium features', '["Leather Seats", "Sunroof", "Navigation", "Heated Seats"]', '["/uploads/cars/bmw1.jpg"]'),
('Tesla', 'Model 3', 2024, 'TSL789', 'electric', 'White', 5, 'automatic', 'electric', 85.00, 'Los Angeles', 'Electric vehicle with autopilot', '["Autopilot", "Full Self-Driving", "Premium Audio"]', '["/uploads/cars/tesla1.jpg"]'),
('Honda', 'CR-V', 2022, 'HON012', 'suv', 'Blue', 7, 'automatic', 'hybrid', 65.00, 'Chicago', 'Spacious family SUV with great mileage', '["Third Row Seating", "Apple CarPlay", "Android Auto"]', '["/uploads/cars/crv1.jpg"]'),
('Mercedes', 'S-Class', 2023, 'MRC345', 'luxury', 'Black', 5, 'automatic', 'petrol', 200.00, 'Miami', 'Ultimate luxury experience', '["Massage Seats", "Refrigerator", "Panoramic Roof", "Premium Sound"]', '["/uploads/cars/mercedes1.jpg"]');