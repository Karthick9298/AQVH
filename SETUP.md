# AQVH914 - Quick Setup Guide

## ⚡ 5-Minute Setup

### 1️⃣ Install Backend Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Expected time**: 2-3 minutes

### 2️⃣ Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Expected time**: 1-2 minutes

### 3️⃣ Start the Application

**Option A: Manual Start (Recommended for Development)**

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2 - Frontend (new terminal)
cd frontend
npm run dev
```

**Option B: Automatic Start (Linux/Mac)**

```bash
./start.sh
```

### 4️⃣ Access the Application

🌐 **Frontend**: http://localhost:3000  
🔌 **Backend API**: http://localhost:5000

## 🧪 Test the Setup

### Quick API Test
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "service": "Quantum Molecule Energy Estimator API",
  "version": "1.0.0"
}
```

### Quick UI Test
1. Open http://localhost:3000
2. Click "Molecule Explorer" in sidebar
3. Click on H₂ card
4. Navigate to "VQE Simulation"
5. Click "Run VQE Simulation"
6. Wait 30-60 seconds
7. Navigate to "Results & Analysis"

## 📦 Dependencies

### Backend (Python)
- Flask 3.0.0 - Web framework
- Qiskit 1.0.0 - Quantum computing
- Qiskit Nature 0.7.2 - Quantum chemistry
- PySCF 2.5.0 - Classical quantum chemistry
- NumPy 1.26.0 - Numerical computing
- Matplotlib 3.8.0 - Plotting

### Frontend (JavaScript)
- React 18.2.0 - UI framework
- Vite 5.0.0 - Build tool
- React Router 6.20.0 - Navigation
- Chart.js 4.4.0 - Charts
- Axios 1.6.2 - HTTP client
- Tailwind CSS 3.3.5 - Styling

## 🚨 Troubleshooting

### Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'qiskit'`

**Solution**:
```bash
cd backend
source venv/bin/activate  # Make sure venv is activated!
pip install -r requirements.txt
```

**Error**: `PySCF compilation failed`

**Solution** (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install gcc g++ gfortran libopenblas-dev
pip install --no-cache-dir pyscf
```

**Solution** (macOS):
```bash
brew install gcc openblas
pip install --no-cache-dir pyscf
```

### Frontend Won't Start

**Error**: `Cannot find module 'react'`

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Change port in vite.config.js
server: {
  port: 3001,  // Use different port
  open: true
}
```

### API Connection Issues

**Error**: Frontend shows "Cannot connect to backend"

**Solution**:
1. Check backend is running: `curl http://localhost:5000/api/health`
2. Check frontend API URL in `src/services/api.js`
3. Disable browser CORS extensions
4. Clear browser cache

## 📊 System Requirements

### Minimum
- **OS**: Linux, macOS, Windows 10+
- **RAM**: 4 GB
- **Python**: 3.9+
- **Node.js**: 18+
- **Disk Space**: 2 GB

### Recommended
- **OS**: Linux (Ubuntu 22.04) or macOS
- **RAM**: 8 GB
- **Python**: 3.11
- **Node.js**: 20 LTS
- **Disk Space**: 5 GB

## 🎯 Next Steps

After successful setup:

1. **Read the docs**: Check `README.md` for full documentation
2. **Explore the code**: See `DEVELOPMENT.md` for architecture details
3. **Run simulations**: Try both H₂ and LiH molecules
4. **Customize**: Add new molecules or modify VQE parameters
5. **Deploy**: Prepare for hackathon demo

## 🆘 Getting Help

If you encounter issues:

1. Check error messages carefully
2. Search for error in documentation
3. Verify all dependencies installed
4. Check Python/Node.js versions
5. Review troubleshooting section

## ✅ Verification Checklist

Before demo/presentation:

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] API health check returns success
- [ ] Can load molecules
- [ ] Can view Hamiltonians
- [ ] Can run VQE simulation
- [ ] Results display correctly
- [ ] Charts render properly
- [ ] Images load (circuit, energy plot)
- [ ] Download results works

## 🎉 You're Ready!

Once all checks pass, you're ready to:
- Demo the application
- Present at hackathon
- Add novel features
- Deploy to production

---

**Need more help?** Check `DEVELOPMENT.md` for detailed guides.

**Ready to deploy?** See deployment section in `README.md`.

**Want to contribute?** Follow the contribution guidelines.

🚀 **Happy Quantum Computing!**
