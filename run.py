import os
import sys
import time
import subprocess
import webbrowser

# Ensure project root is in Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.seed import seed_database

def run_app():
    print("=" * 65)
    print("  BuildSure AI — Agentic Construction Risk Intelligence Platform")
    print("=" * 65)
    
    # 1. Seed Database
    print("\n[1/3] Initializing Database & Seed Data...")
    seed_database() 
    
    # 2. Check frontend node_modules
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "frontend"))
    node_modules_dir = os.path.join(frontend_dir, "node_modules")
    
    if not os.path.exists(node_modules_dir):
        print("\n[2/3] Installing Frontend Dependencies (npm install)...")
        subprocess.run("npm install", cwd=frontend_dir, shell=True, check=True)
    else:
        print("\n[2/3] Frontend dependencies ready.")

    # 3. Launch Frontend Vite Dev Server in subprocess
    print("\n[3/3] Launching React Web App & FastAPI Backend...")
    frontend_process = subprocess.Popen(
        "npm run dev",
        cwd=frontend_dir,
        shell=True
    )
    
    print("\n" + "─" * 65)
    print("  🚀 Web Application running at:  http://localhost:5173")
    print("  ⚙️  FastAPI Backend running at:  http://localhost:8000")
    print("  📚  Swagger API Docs at:        http://localhost:8000/docs")
    print("─" * 65 + "\n")
    
    # Open browser after 2 seconds
    time.sleep(2)
    webbrowser.open("http://localhost:5173")
    
    # Start Backend Uvicorn server in main thread
    import uvicorn
    try:
        uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\nShutting down BuildSure AI services...")
        frontend_process.terminate()

if __name__ == "__main__":
    run_app()
