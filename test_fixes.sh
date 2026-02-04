#!/bin/bash
# Test script for AQVH2 fixes

echo "🧪 Testing AQVH2 Backend Fixes..."
echo "================================"

# Start backend
echo "🚀 Starting backend..."
cd /home/karthikeya/AQVH2/backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
sleep 5

# Test health
echo ""
echo "📡 Testing health endpoint..."
curl -s http://localhost:5000/api/health | python3 -m json.tool

# Test molecule
echo ""
echo "🧬 Testing molecule endpoint..."
curl -s http://localhost:5000/api/molecule/H2 | python3 -m json.tool

# Test Hamiltonian
echo ""
echo "⚛️  Testing Hamiltonian endpoint..."
curl -s http://localhost:5000/api/hamiltonian/H2 | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"Qubits: {d['hamiltonian']['num_qubits']}\"); print(f\"Classical Energy: {d['hamiltonian']['classical_energy']:.6f} Ha\")"

# Test VQE with low iterations
echo ""
echo "🔬 Testing VQE endpoint (30 iterations)..."
echo "This will take 30-60 seconds..."
curl -s -X POST http://localhost:5000/api/run-vqe/H2 \
  -H "Content-Type: application/json" \
  -d '{"max_iter": 30}' | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"VQE Energy: {d.get('vqe_energy', 'ERROR'):.6f} Ha\"); print(f\"Classical Energy: {d.get('classical_energy', 'ERROR'):.6f} Ha\"); print(f\"Iterations: {d.get('num_iterations', 'ERROR')}\"); print(f\"Error: {abs(d.get('vqe_energy', 0) - (-1.857)):.6f} Ha from expected -1.857 Ha\")"

echo ""
echo "✅ Tests complete!"
echo "Expected VQE energy for H2: ~-1.857 Ha"
echo "Expected Classical HF energy: ~-1.117 Ha"

# Kill backend
kill $BACKEND_PID 2>/dev/null
