#!/bin/bash

# AQVH914 Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting AQVH914 - Quantum Molecule Energy Estimator"
echo "=================================================="

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Node modules not found!"
    echo "Please run: cd frontend && npm install"
    exit 1
fi

echo ""
echo "✅ Starting Backend Server..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

echo "✅ Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=================================================="
echo "🎉 AQVH914 is running!"
echo "=================================================="
echo "📡 Backend:  http://localhost:5000"
echo "🖥️  Frontend: http://localhost:3000"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
