"""
Database configuration and session management for Educational Content Platform
SQLAlchemy setup equivalent to your TypeScript db.ts
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment (same as your TypeScript setup)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    """
    Database dependency for FastAPI routes
    Equivalent to your TypeScript storage pattern
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()