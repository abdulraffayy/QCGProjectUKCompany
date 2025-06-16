-- Educational Content Platform Database Setup
-- Run this in PostgreSQL to create the database and user

-- Create database
CREATE DATABASE educational_content_db;

-- Create user with password
CREATE USER edu_user WITH PASSWORD 'edu_secure_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE educational_content_db TO edu_user;

-- Connect to the new database
\c educational_content_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO edu_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO edu_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO edu_user;

-- Show confirmation
SELECT 'Database and user created successfully!' as status;