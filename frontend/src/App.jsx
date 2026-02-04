import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import MoleculeExplorer from './pages/MoleculeExplorer';
import HamiltonianViewer from './pages/HamiltonianViewer';
import VQESimulation from './pages/VQESimulation';
import ResultsAnalysis from './pages/ResultsAnalysis';
import OptimizerComparison from './pages/OptimizerComparison';
import BondLengthScan from './pages/BondLengthScan';
import AdvancedAnalytics from './pages/AdvancedAnalytics';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/molecules" element={<MoleculeExplorer />} />
              <Route path="/hamiltonian" element={<HamiltonianViewer />} />
              <Route path="/simulation" element={<VQESimulation />} />
              <Route path="/results" element={<ResultsAnalysis />} />
              <Route path="/optimizer" element={<OptimizerComparison />} />
              <Route path="/bond-scan" element={<BondLengthScan />} />
              <Route path="/analytics" element={<AdvancedAnalytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
