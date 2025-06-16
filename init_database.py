#!/usr/bin/env python3
"""
Database initialization script for Educational Content Platform
Run this after setting up PostgreSQL to create tables and initial data
"""

import os
import sys
from pathlib import Path

# Add python_backend to path
sys.path.append(str(Path(__file__).parent / "python_backend"))

try:
    from python_backend.database import engine, get_db
    from python_backend.models import Base, QaqfLevel, QaqfCharacteristic
    from sqlalchemy.orm import Session
    from sqlalchemy import text
    print("✓ Successfully imported database modules")
except ImportError as e:
    print(f"✗ Error importing modules: {e}")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)

def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")
        return True
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        return False

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            if result.fetchone()[0] == 1:
                print("✓ Database connection successful")
                return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("Please check your DATABASE_URL in .env file")
        return False

def insert_initial_data():
    """Insert initial QAQF data"""
    try:
        db = next(get_db())
        
        # Check if data already exists
        existing_levels = db.query(QaqfLevel).count()
        if existing_levels > 0:
            print("✓ Initial data already exists")
            return True
        
        # QAQF Levels
        qaqf_levels = [
            {"level": 1, "name": "Basic Foundation", "description": "Entry level understanding"},
            {"level": 2, "name": "Basic Application", "description": "Basic application of knowledge"},
            {"level": 3, "name": "Basic Integration", "description": "Integration of basic concepts"},
            {"level": 4, "name": "Intermediate Analysis", "description": "Analytical thinking and evaluation"},
            {"level": 5, "name": "Intermediate Synthesis", "description": "Synthesis of complex information"},
            {"level": 6, "name": "Intermediate Evaluation", "description": "Critical evaluation and judgment"},
            {"level": 7, "name": "Advanced Research", "description": "Independent research and investigation"},
            {"level": 8, "name": "Advanced Innovation", "description": "Innovation and creative solutions"},
            {"level": 9, "name": "Advanced Leadership", "description": "Leadership and strategic thinking"}
        ]
        
        for level_data in qaqf_levels:
            level = QaqfLevel(**level_data)
            db.add(level)
        
        # QAQF Characteristics
        characteristics = [
            {"name": "Knowledge and understanding", "description": "Depth and breadth of knowledge", "category": "cognitive"},
            {"name": "Application of knowledge", "description": "Practical application skills", "category": "application"},
            {"name": "Critical thinking", "description": "Analysis and evaluation abilities", "category": "cognitive"},
            {"name": "Communication", "description": "Effective communication skills", "category": "interpersonal"},
            {"name": "Self-management", "description": "Personal effectiveness and learning", "category": "personal"},
            {"name": "Problem solving", "description": "Systematic problem resolution", "category": "application"},
            {"name": "Teamwork", "description": "Collaborative working abilities", "category": "interpersonal"},
            {"name": "Leadership", "description": "Leading and influencing others", "category": "interpersonal"},
            {"name": "Innovation", "description": "Creative and innovative thinking", "category": "cognitive"},
            {"name": "Ethics", "description": "Ethical awareness and responsibility", "category": "personal"}
        ]
        
        for char_data in characteristics:
            characteristic = QaqfCharacteristic(**char_data)
            db.add(characteristic)
        
        db.commit()
        print("✓ Initial QAQF data inserted successfully")
        return True
        
    except Exception as e:
        print(f"✗ Error inserting initial data: {e}")
        if 'db' in locals():
            db.rollback()
        return False
    finally:
        if 'db' in locals():
            db.close()

def main():
    print("=" * 50)
    print("Educational Content Platform Database Setup")
    print("=" * 50)
    print()
    
    # Test connection first
    if not test_connection():
        print("\nPlease fix the database connection and try again.")
        sys.exit(1)
    
    # Create tables
    if not create_tables():
        print("\nFailed to create database tables.")
        sys.exit(1)
    
    # Insert initial data
    if not insert_initial_data():
        print("\nFailed to insert initial data.")
        sys.exit(1)
    
    print()
    print("=" * 50)
    print("✓ Database initialization completed successfully!")
    print("=" * 50)
    print()
    print("You can now start the application with: npm run dev")

if __name__ == "__main__":
    main()