-- Create managers table
CREATE TABLE IF NOT EXISTS managers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  contacts_messaged INTEGER DEFAULT 0,
  contacts_converted INTEGER DEFAULT 0,
  days_missed INTEGER DEFAULT 0,
  days_completed INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. After the table is created, seed the data by making a POST request to:
--    http://localhost:3000/api/seed
-- 3. This will create the three managers with their passwords:
--    - tosin (password: tosin)
--    - jimi (password: jimi)
--    - kunle (password: kunle)
-- 4. And one admin user:
--    - admin (password: admin123)

