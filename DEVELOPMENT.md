# Development Guide - AQVH914

## 🎯 Quick Start (5 Minutes)

### Step 1: Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install
```

### Step 3: Run Application
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 4: Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

## 🧪 Testing the System

### 1. Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get molecules
curl http://localhost:5000/api/molecules

# Get H2 Hamiltonian
curl http://localhost:5000/api/hamiltonian/H2

# Run VQE (may take 30-60 seconds)
curl -X POST http://localhost:5000/api/run-vqe/H2
```

### 2. Test Frontend Flow
1. Navigate to http://localhost:3000
2. Click through sidebar: Overview → Molecules → Hamiltonian → Simulation → Results
3. Select H2 in Molecule Explorer
4. Load Hamiltonian in Hamiltonian Viewer
5. Run VQE Simulation (wait for completion)
6. View Results & Analysis

## 📝 Code Structure

### Backend Architecture

```
quantum_engine.py
├─ QuantumMoleculeEngine (main class)
   ├─ _get_molecule_data()     # Molecular configurations
   ├─ build_hamiltonian()       # PySCF + Jordan-Wigner
   ├─ create_ansatz()           # TwoLocal circuit
   ├─ run_vqe()                 # VQE optimization
   ├─ generate_circuit_image()  # Circuit visualization
   └─ generate_energy_plot()    # Convergence plot
```

### Frontend Architecture

```
App.jsx (Router)
├─ Sidebar.jsx (Navigation)
└─ Pages/
   ├─ Overview.jsx          # Introduction
   ├─ MoleculeExplorer.jsx  # Molecule selection
   ├─ HamiltonianViewer.jsx # Pauli terms table
   ├─ VQESimulation.jsx     # Run simulations
   └─ ResultsAnalysis.jsx   # Charts & insights
```

## 🔧 Customization

### Adding a New Molecule

#### Backend (quantum_engine.py)
```python
molecules = {
    'H2O': {
        'geometry': 'O 0.0 0.0 0.0; H 0.757 0.586 0.0; H -0.757 0.586 0.0',
        'charge': 0,
        'spin': 0,
        'basis': 'sto3g',
        'description': 'Water Molecule (H₂O)',
        'electrons': 10,
        'atoms': 3,
        'bond_length': 0.96,
        'theory': 'Bent molecule with two O-H bonds...'
    }
}
```

#### Frontend (api.js)
API automatically supports new molecules - just update UI dropdowns.

### Modifying VQE Parameters

```python
# In quantum_engine.py - create_ansatz()
ansatz = TwoLocal(
    num_qubits,
    rotation_blocks=['ry', 'rz'],  # Change rotation gates
    entanglement_blocks='cx',       # Change entanglement
    entanglement='linear',          # full, circular, sca
    reps=2                          # Increase circuit depth
)

# In quantum_engine.py - run_vqe()
optimizer = SLSQP(maxiter=100)  # Or use COBYLA, SPSA
```

### Changing UI Theme

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',  // Blue
      secondary: '#8b5cf6', // Purple
      accent: '#10b981'     // Green
    }
  }
}
```

## 🐛 Debugging

### Backend Issues

**Issue**: "ModuleNotFoundError: No module named 'qiskit'"
```bash
# Solution: Activate virtual environment
source backend/venv/bin/activate
pip install -r requirements.txt
```

**Issue**: VQE takes too long
```python
# Solution: Reduce max_iter in run_vqe()
optimizer = SLSQP(maxiter=50)  # Instead of 100
```

**Issue**: PySCF compilation errors
```bash
# Solution: Install build dependencies
# Ubuntu/Debian
sudo apt-get install gcc g++ gfortran libopenblas-dev

# macOS
brew install gcc openblas
```

### Frontend Issues

**Issue**: "Cannot connect to backend"
```javascript
// Check API_BASE_URL in services/api.js
const API_BASE_URL = 'http://localhost:5000/api';
```

**Issue**: Chart not rendering
```bash
# Reinstall chart.js
npm install chart.js react-chartjs-2
```

**Issue**: Tailwind styles not applying
```bash
# Rebuild
npm run build
npm run dev
```

## 📊 Performance Optimization

### Backend
- **Cache Hamiltonians**: First run generates JSON, subsequent runs load from file
- **Reduce Circuit Depth**: Lower `reps` in ansatz for faster simulation
- **Use Estimator Primitive**: Already implemented for optimal performance

### Frontend
- **Code Splitting**: Vite handles automatically
- **Lazy Loading**: Routes load on-demand
- **Chart Optimization**: Limit data points for large datasets

## 🧪 Advanced Features to Add

### 1. Noise Simulation
```python
from qiskit_aer.noise import NoiseModel
from qiskit.providers.fake_provider import FakeManilaV2

# Add to run_vqe()
backend = FakeManilaV2()
noise_model = NoiseModel.from_backend(backend)
```

### 2. More Optimizers
```python
from qiskit_algorithms.optimizers import ADAM, NFT, GradientDescent

# Try different optimizers
optimizer = ADAM(maxiter=100, lr=0.01)
```

### 3. UCCSD Ansatz
```python
from qiskit_nature.second_q.circuit.library import UCCSD

# Replace TwoLocal
ansatz = UCCSD(
    num_spatial_orbitals=num_qubits // 2,
    num_particles=(num_electrons_alpha, num_electrons_beta),
    mapper=mapper
)
```

## 🎨 UI Enhancements

### 1. Add Toast Notifications
```bash
npm install react-hot-toast
```

```javascript
import toast from 'react-hot-toast';

toast.success('VQE completed successfully!');
toast.error('Simulation failed');
```

### 2. Add Loading Skeletons
```javascript
{loading ? (
  <div className="animate-pulse bg-gray-800 h-20 rounded-lg"></div>
) : (
  <RealContent />
)}
```

### 3. Add Export to PDF
```bash
npm install jspdf html2canvas
```

## 📈 Monitoring & Logging

### Backend Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"VQE started for {molecule_name}")
logger.error(f"Error: {str(e)}")
```

### Frontend Analytics
```javascript
// Track user actions
const trackEvent = (action, data) => {
  console.log('Event:', action, data);
  // Add analytics service here
};
```

## 🚀 Deployment

### Backend (Flask)
```bash
# Use Gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Vite)
```bash
# Build for production
npm run build

# Serve build folder with nginx or vercel
```

## 📚 Learning Resources

- **Qiskit Textbook**: https://qiskit.org/textbook
- **VQE Tutorial**: https://qiskit.org/ecosystem/nature/tutorials/
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

## 💡 Tips for Hackathon Demo

1. **Pre-run simulations**: Have results ready before demo
2. **Prepare talking points**: Explain VQE, Hamiltonian, convergence
3. **Show full flow**: Overview → Simulation → Results
4. **Highlight novelty**: Mention future drug discovery application
5. **Be interactive**: Let judges click through UI
6. **Show code quality**: Mention architecture, services, modularity

## ✅ Pre-Demo Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] H2 simulation tested
- [ ] LiH simulation tested
- [ ] All pages load correctly
- [ ] Charts render properly
- [ ] Circuit images generate
- [ ] Download results works
- [ ] API responses validated
- [ ] No console errors

---

**Happy Coding! 🚀**
