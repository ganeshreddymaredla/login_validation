-- ═══════════════════════════════════════════════
-- database.sql
-- Run this file in MySQL to set up the database
-- ═══════════════════════════════════════════════

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS user_auth;

-- Step 2: Use the database
USE user_auth;

-- Step 3: Create the users table
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,           
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Optional: View all users (for testing)
-- SELECT id, name, email, created_at FROM users;
