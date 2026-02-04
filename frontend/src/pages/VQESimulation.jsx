import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { FiZap, FiPlay, FiImage } from 'react-icons/fi';

const VQESimulation = () => {
  const [selectedMolecule, setSelectedMolecule] = useState('H2');
  const [running, setRunning] = useState(false);
  const [circuit, setCircuit] = useState(null);
  const [theory, setTheory] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadTheory(selectedMolecule);
  }, [selectedMolecule]);

  const loadTheory = async (moleculeName) => {
    try {
      const response = await api.getTheory(moleculeName);
      setTheory(response.data.theory);
    } catch (error) {
      console.error('Error loading theory:', error);
    }
  };

  const loadCircuit = async (moleculeName) => {
    try {
      const response = await api.getCircuit(moleculeName);
      setCircuit(response.data.circuit_url);
    } catch (error) {
      console.error('Error loading circuit:', error);
    }
  };

  const handleMoleculeChange = (e) => {
    const molecule = e.target.value;
    setSelectedMolecule(molecule);
    setCircuit(null);
    loadTheory(molecule);
  };

  const runSimulation = async () => {
    setRunning(true);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      // Load circuit first
      await loadCircuit(selectedMolecule);
      
      // Run VQE
      const response = await api.runVQE(selectedMolecule);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Store results in sessionStorage to access in Results page
      sessionStorage.setItem('vqe_results', JSON.stringify(response.data));
      
      // Show success message
      alert('VQE simulation completed! View results in the Results & Analysis page.');
      
    } catch (error) {
      console.error('Error running VQE:', error);
      clearInterval(progressInterval);
      alert('Error running simulation. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">VQE Simulation</h1>
        <p className="text-gray-400 text-lg">Run quantum simulations to find ground state energies</p>
      </div>

      <Card title="Simulation Setup" icon={FiZap}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Select Molecule
            </label>
            <select
              value={selectedMolecule}
              onChange={handleMoleculeChange}
              disabled={running}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="H2">Hydrogen (H₂)</option>
              <option value="LiH">Lithium Hydride (LiH)</option>
            </select>
          </div>

          <button
            onClick={runSimulation}
            disabled={running}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiPlay />
            {running ? 'Running Simulation...' : 'Run VQE Simulation'}
          </button>

          {running && (
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {theory && (
        <Card title="Theory & Background">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Molecule: {theory.molecule}</h4>
              <p className="text-gray-300 text-sm">{theory.why_important}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Chemistry</h5>
                <p className="text-sm text-gray-300">{theory.chemistry}</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">VQE Approach</h5>
                <p className="text-sm text-gray-300">{theory.vqe_approach}</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Hamiltonian</h5>
                <p className="text-sm text-gray-300">{theory.hamiltonian}</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h5 className="text-xs font-semibold text-gray-400 mb-2">Convergence</h5>
                <p className="text-sm text-gray-300">{theory.convergence}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {circuit && (
        <Card title="Quantum Circuit" icon={FiImage}>
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">Circuit Explanation:</span> This variational ansatz uses parameterized rotation gates (RY, RZ) and entangling gates (CNOT) to prepare trial quantum states. The parameters are optimized classically to minimize energy.
              </p>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <img
                src={api.getStaticUrl(circuit)}
                alt="Quantum Circuit"
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Ansatz: TwoLocal with linear entanglement | Depth: 2 | Gates: RY, RZ, CNOT
            </div>
          </div>
        </Card>
      )}

      {running && <LoadingSpinner message="Running VQE optimization..." />}
    </div>
  );
};

export default VQESimulation;
