-- init-test-db.sql - Initialize test database

-- Create test database if it doesn't exist
-- This is mainly for documentation since the database is created by POSTGRES_DB env var

-- Enable extensions that might be needed for testing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create any additional test-specific schemas or configurations here
-- For now, we'll let Prisma handle the schema creation