import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Default to SQLite for zero-config local testing if PostgreSQL is not specified
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./buildsure.db")

# SQLite needs connect_args for multithreading in FastAPI
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for obtaining DB session per request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema_migrations():
    """Automatically adds new Milestone 2 columns to existing tables if missing"""
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    with engine.connect() as conn:
        if "ppe_violations" in tables:
            cols = [c["name"] for c in inspector.get_columns("ppe_violations")]
            if "zone" not in cols:
                conn.execute(text("ALTER TABLE ppe_violations ADD COLUMN zone VARCHAR(100) DEFAULT 'General Site'"))
                conn.commit()
        if "safety_incidents" in tables:
            cols = [c["name"] for c in inspector.get_columns("safety_incidents")]
            if "zone" not in cols:
                conn.execute(text("ALTER TABLE safety_incidents ADD COLUMN zone VARCHAR(100) DEFAULT 'General Site'"))
                conn.commit()
            if "description" not in cols:
                conn.execute(text("ALTER TABLE safety_incidents ADD COLUMN description TEXT"))
                conn.commit()
        if "alerts" in tables:
            cols = [c["name"] for c in inspector.get_columns("alerts")]
            if "message" not in cols:
                conn.execute(text("ALTER TABLE alerts ADD COLUMN message TEXT"))
                conn.commit()
