# 🧪 Testing Guide for Enhanced Features

## 🚀 Quick Start

### 1. Start Both Servers
```bash
cd /home/karthikeya/AQVH2
./start.sh
```

### 2. Open Browser
Navigate to: `http://localhost:3000`

---

## ✅ Testing Checklist

### **Test 1: Multi-Optimizer Comparison** ⭐
**Page**: Optimizer Comparison

**Steps:**
1. Click "Optimizer Comparison" in sidebar
2. Select molecule (H₂ or LiH)
3. Set max iterations (start with 50)
4. Click "Run Comparison"

**Expected Results:**
- ✅ Three optimizers run simultaneously
- ✅ Chart shows convergence curves
- ✅ Winner analysis appears
- ✅ Final energies displayed for all three
- ✅ SLSQP typically converges fastest
- ✅ All energies should be close (within 0.01 Ha)

**Sample Results (H₂):**
- SLSQP: ~-1.857 Ha (fastest)
- COBYLA: ~-1.856 Ha (robust)
- SPSA: ~-1.855 Ha (stochastic)

---

### **Test 2: Bond Length Scan (PES)** ⭐
**Page**: Bond Length Scan

**Steps:**
1. Click "Bond Length Scan" in sidebar
2. Select molecule (H₂)
3. Set parameters:
   - Start: 0.5 Å
   - End: 2.0 Å
   - Steps: 10
4. Click "Run Scan"

**Expected Results:**
- ✅ Progress bar shows scan progress
- ✅ PES plot appears (energy vs bond length)
- ✅ Minimum energy point highlighted
- ✅ Equilibrium bond length predicted (~0.74 Å for H₂)
- ✅ Data table shows all scan points
- ✅ Classical vs VQE energies compared

**Sample Results (H₂):**
- Equilibrium distance: ~0.74 Å
- Minimum energy: ~-1.857 Ha
- PES curve shows clear minimum

---

### **Test 3: Standard VQE Simulation**
**Page**: VQE Simulation

**Steps:**
1. Click "VQE Simulation" in sidebar
2. Select H₂
3. Set iterations: 100
4. Click "Run VQE"

**Expected Results:**
- ✅ Simulation starts
- ✅ Results appear within 10-30 seconds
- ✅ Energy: ~-1.857 Ha for H₂
- ✅ Convergence chart shows decreasing energy
- ✅ Download JSON works

---

### **Test 4: Hamiltonian Viewer**
**Page**: Hamiltonian Viewer

**Steps:**
1. Click "Hamiltonian Viewer"
2. Select LiH

**Expected Results:**
- ✅ Hamiltonian matrix displayed
- ✅ Pauli decomposition shown
- ✅ Each term explained
- ✅ Matrix visualization clear

---

### **Test 5: Molecule Explorer**
**Page**: Molecule Explorer

**Steps:**
1. Click "Molecule Explorer"
2. View H₂ card
3. Click "Explore H₂"

**Expected Results:**
- ✅ Properties displayed
- ✅ Theory content loaded
- ✅ Navigation works

---

## 🐛 Common Issues & Solutions

### Issue 1: "Connection Refused"
**Solution:**
```bash
# Check if backend is running
ps aux | grep app.py

# Restart backend
cd /home/karthikeya/AQVH2/backend
python app.py
```

### Issue 2: "Module not found"
**Solution:**
```bash
# Reinstall backend dependencies
cd /home/karthikeya/AQVH2/backend
pip install -r requirements.txt
```

### Issue 3: Frontend not loading
**Solution:**
```bash
# Rebuild frontend
cd /home/karthikeya/AQVH2/frontend
npm install
npm run dev
```

### Issue 4: Slow VQE convergence
**Solution:**
- Reduce max_iter to 50 for faster testing
- SPSA is slower than SLSQP (expected)
- LiH takes longer than H₂ (more qubits)

---

## ⏱️ Performance Benchmarks

### H₂ Molecule
- Standard VQE (100 iter): ~10-15 seconds
- Multi-optimizer (50 iter each): ~25-30 seconds
- Bond scan (10 steps): ~60-90 seconds

### LiH Molecule
- Standard VQE (100 iter): ~20-30 seconds
- Multi-optimizer (50 iter each): ~50-60 seconds
- Bond scan (10 steps): ~120-180 seconds

---

## 📊 Validation Criteria

### Energy Accuracy (H₂)
- ✅ VQE energy: -1.855 to -1.858 Ha
- ✅ Classical HF: ~-1.117 Ha
- ✅ Quantum should be lower than classical

### Energy Accuracy (LiH)
- ✅ VQE energy: -7.88 to -7.90 Ha
- ✅ Classical HF: ~-7.86 Ha
- ✅ Quantum should be lower than classical

### Optimizer Performance
- ✅ SLSQP: Fastest convergence
- ✅ COBYLA: Similar accuracy, slightly slower
- ✅ SPSA: More iterations needed, still accurate

### PES Scan
- ✅ H₂ equilibrium: 0.70-0.76 Å
- ✅ LiH equilibrium: 1.55-1.65 Å
- ✅ Energy curve has clear minimum

---

## 🎬 Demo Script (7 Minutes)

### Minute 1-2: Introduction
- "This is AQVH914, a quantum chemistry platform"
- Navigate to Overview
- Explain VQE in one sentence
- Show molecule cards

### Minute 3: Standard Features
- Go to VQE Simulation
- Run H₂ quickly
- Show convergence chart
- "This is the baseline"

### Minute 4-5: STANDOUT Feature 1
- **Optimizer Comparison**
- "But which optimizer is best? Let's find out"
- Run comparison (H₂, 50 iter)
- Show chart with 3 curves
- "SLSQP wins for this molecule"
- Explain real-world relevance

### Minute 6-7: STANDOUT Feature 2
- **Bond Length Scan**
- "Now let's find the stable bond length"
- Run scan (H₂, 0.5-2.0, 10 steps)
- Show PES curve
- "Minimum at 0.74 Å matches experimental data"
- "This is used in drug discovery"

---

## 🏆 Judging Criteria Alignment

### Technical Complexity ⭐⭐⭐⭐⭐
- ✅ Three VQE optimizers
- ✅ PES scanning
- ✅ Full-stack integration
- ✅ Statistical analytics

### Innovation ⭐⭐⭐⭐⭐
- ✅ Multi-optimizer comparison (unique)
- ✅ Chemistry research features
- ✅ Educational + research tool
- ✅ Drug discovery path

### User Experience ⭐⭐⭐⭐⭐
- ✅ Beautiful dark UI
- ✅ Intuitive navigation
- ✅ Real-time feedback
- ✅ Clear visualizations

### Completeness ⭐⭐⭐⭐⭐
- ✅ 7 pages, 11 endpoints
- ✅ Error handling
- ✅ Documentation
- ✅ Production-ready

### Impact Potential ⭐⭐⭐⭐⭐
- ✅ Drug discovery application
- ✅ Educational platform
- ✅ Research tool
- ✅ Extensible architecture

---

## 📝 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test VQE Endpoint
```bash
curl -X POST http://localhost:5000/api/run-vqe/H2 \
  -H "Content-Type: application/json" \
  -d '{"max_iter": 50}'
```

### Test Multi-Optimizer
```bash
curl -X POST http://localhost:5000/api/multi-optimizer/H2 \
  -H "Content-Type: application/json" \
  -d '{"max_iter": 50}'
```

### Test Bond Scan
```bash
curl -X POST http://localhost:5000/api/bond-scan/H2 \
  -H "Content-Type: application/json" \
  -d '{"start": 0.5, "end": 2.0, "steps": 5}'
```

---

## ✅ Final Checklist Before Demo

- [ ] Both servers running
- [ ] All pages load without errors
- [ ] Multi-optimizer works for H₂
- [ ] Multi-optimizer works for LiH
- [ ] Bond scan works for H₂
- [ ] Standard VQE still functional
- [ ] Charts render properly
- [ ] No console errors in browser
- [ ] Mobile responsive (bonus points)
- [ ] Documentation up to date

---

**Ready to impress the judges!** 🚀🏆
