import React, { useState, useRef } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { 
  FiZap, FiPlay, FiCheckCircle, FiActivity, FiCpu, FiTrendingUp,
  FiAlertCircle, FiCircle, FiCheck
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VQESimulationRealTime = () => {
  const [selectedMolecule, setSelectedMolecule] = useState('H2');
  const [maxIterations, setMaxIterations] = useState(100);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  
  // Real-time state
  const [currentStep, setCurrentStep] = useState('setup');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to start');
  
  // Step data
  const [initData, setInitData] = useState(null);
  const [hamiltonianData, setHamiltonianData] = useState(null);
  const [circuitData, setCircuitData] = useState(null);
  const [vqeIterations, setVqeIterations] = useState([]);
  const [finalResults, setFinalResults] = useState(null);
  
  const eventSourceRef = useRef(null);
  
  const steps = [
    { id: 'setup', name: 'Setup', icon: FiZap, color: 'blue' },
    { id: 'initialize', name: 'Initialize', icon: FiCpu, color: 'purple' },
    { id: 'hamiltonian', name: 'Hamiltonian', icon: FiActivity, color: 'green' },
    { id: 'circuit', name: 'Circuit', icon: FiCircle, color: 'yellow' },
    { id: 'vqe', name: 'VQE Optimization', icon: FiTrendingUp, color: 'orange' },
    { id: 'results', name: 'Results', icon: FiCheckCircle, color: 'green' }
  ];
  
  const getStepStatus = (stepId) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const resetSimulation = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setCurrentStep('setup');
    setProgress(0);
    setStatusMessage('Ready to start');
    setInitData(null);
    setHamiltonianData(null);
    setCircuitData(null);
    setVqeIterations([]);
    setFinalResults(null);
    setError(null);
  };

  const runSimulation = async () => {
    setRunning(true);
    setError(null);
    resetSimulation();
    
    try {
      // Start Server-Sent Events stream
      eventSourceRef.current = api.runVQEStream(
        selectedMolecule,
        { max_iter: maxIterations },
        (data) => {
          // Handle each streaming message
          console.log('SSE Message:', data);
          
          setCurrentStep(data.step);
          setProgress(data.progress || 0);
          setStatusMessage(data.message || '');
          
          // Update step-specific data
          if (data.step === 'initialize' && data.status === 'complete') {
            setInitData(data.data);
          } else if (data.step === 'hamiltonian' && data.status === 'complete') {
            setHamiltonianData(data.data);
          } else if (data.step === 'circuit' && data.status === 'complete') {
            setCircuitData(data.data);
          } else if (data.step === 'vqe' && data.status === 'iterating') {
            // Real-time VQE iteration update
            setVqeIterations(prev => [...prev, data.data]);
          } else if (data.step === 'results' && data.status === 'complete') {
            setFinalResults(data.data);
          }
        },
        (err) => {
          // Handle error
          console.error('VQE Stream Error:', err);
          setError(err);
          setRunning(false);
        },
        (finalData) => {
          // Handle completion
          console.log('VQE Stream Complete:', finalData);
          setFinalResults(finalData);
          setRunning(false);
          setStatusMessage('Simulation complete!');
        }
      );
    } catch (error) {
      console.error('Error starting VQE stream:', error);
      setError(error.message);
      setRunning(false);
    }
  };

  // Chart data from real VQE iterations
  const chartData = {
    labels: vqeIterations.map(iter => iter.iteration),
    datasets: [
      {
        label: 'Energy (Hartree)',
        data: vqeIterations.map(iter => iter.energy),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: {
      legend: { labels: { color: '#fff' } },
      title: {
        display: true,
        text: 'Real-Time VQE Convergence (Actual Qiskit Data)',
        color: '#fff',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: { 
        title: { display: true, text: 'Iteration', color: '#9ca3af' },
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: { 
        title: { display: true, text: 'Energy (Ha)', color: '#9ca3af' },
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          🔬 Real-Time VQE Simulation
        </h1>
        <p className="text-gray-400 text-lg">
          Live quantum computing with actual Qiskit operations - no simulation!
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 font-semibold">Overall Progress</span>
          <span className="text-blue-400 font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-400 text-sm mt-2">{statusMessage}</p>
      </div>

      {/* Step Progress */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quantum Workflow Pipeline</h2>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step.id);
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all ${
                    status === 'complete' ? 'bg-green-600' :
                    status === 'active' ? 'bg-blue-600 animate-pulse ring-4 ring-blue-400/50' :
                    'bg-gray-700'
                  }`}>
                    {status === 'complete' ? (
                      <FiCheck className="w-7 h-7 text-white" />
                    ) : (
                      <Icon className={`w-7 h-7 ${status === 'active' ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <p className={`text-sm font-semibold text-center ${
                    status === 'active' ? 'text-blue-400' :
                    status === 'complete' ? 'text-green-400' :
                    'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 mb-8 transition-all ${
                    getStepStatus(steps[index + 1].id) === 'complete' ? 'bg-green-600' :
                    getStepStatus(steps[index + 1].id) === 'active' ? 'bg-blue-600' :
                    'bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Setup Controls */}
      <Card title="Simulation Configuration" icon={FiZap}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Molecule
            </label>
            <select
              value={selectedMolecule}
              onChange={(e) => setSelectedMolecule(e.target.value)}
              disabled={running}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="H2">Hydrogen (H₂)</option>
              <option value="LiH">Lithium Hydride (LiH)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Max Iterations
            </label>
            <input
              type="number"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value))}
              disabled={running}
              min="10"
              max="200"
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        <button
          onClick={runSimulation}
          disabled={running}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 mt-4"
        >
          {running ? (
            <>
              <LoadingSpinner />
              <span>Running Real-Time VQE...</span>
            </>
          ) : (
            <>
              <FiPlay className="w-5 h-5" />
              <span>🚀 Start Real-Time Simulation</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg flex items-start">
            <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Initialize Data */}
      {initData && (
        <Card title="✓ Molecule Initialized" icon={FiCpu}>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Molecule</p>
              <p className="text-2xl font-bold text-blue-400">{initData.molecule}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Electrons</p>
              <p className="text-2xl font-bold text-purple-400">{initData.electrons}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Atoms</p>
              <p className="text-2xl font-bold text-green-400">{initData.atoms}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Bond Length</p>
              <p className="text-2xl font-bold text-yellow-400">{initData.bond_length} Å</p>
            </div>
          </div>
        </Card>
      )}

      {/* Hamiltonian Data */}
      {hamiltonianData && (
        <Card title="✓ Hamiltonian Mapped (Jordan-Wigner)" icon={FiActivity}>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Qubits Required</p>
                <p className="text-3xl font-bold text-blue-400">{hamiltonianData.num_qubits}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Pauli Terms</p>
                <p className="text-3xl font-bold text-purple-400">{hamiltonianData.num_terms}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Classical (HF) Energy</p>
                <p className="text-3xl font-bold text-green-400">
                  {hamiltonianData.classical_energy?.toFixed(4)} Ha
                </p>
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">Pauli Decomposition (Top 5 Terms)</h3>
              <div className="space-y-2">
                {hamiltonianData.pauli_terms?.map((term, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                    <span className="font-mono text-blue-300 font-semibold">{term.pauli}</span>
                    <span className="text-gray-300 font-mono">{term.coefficient?.toFixed(4)}</span>
                    <span className="text-gray-500 text-sm">{term.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Circuit Data */}
      {circuitData && (
        <Card title="✓ Variational Quantum Circuit Constructed" icon={FiCircle}>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Qubits</p>
                <p className="text-2xl font-bold text-blue-400">{circuitData.num_qubits}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Parameters</p>
                <p className="text-2xl font-bold text-purple-400">{circuitData.num_parameters}</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Ansatz Type</p>
                <p className="text-sm font-bold text-green-400">{circuitData.ansatz_type}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <img 
                src={`http://localhost:5000${circuitData.circuit_url}`}
                alt="Quantum Circuit Diagram" 
                className="w-full"
                onError={(e) => {
                  console.error('Failed to load circuit image');
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* VQE Optimization (Live) */}
      {vqeIterations.length > 0 && (
        <Card title="⚡ VQE Optimization (Live Updates)" icon={FiTrendingUp}>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Current Iteration</p>
                <p className="text-3xl font-bold text-blue-400 animate-pulse">
                  {vqeIterations[vqeIterations.length - 1]?.iteration || 0}
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Current Energy</p>
                <p className="text-3xl font-bold text-purple-400 animate-pulse">
                  {vqeIterations[vqeIterations.length - 1]?.energy?.toFixed(4)} Ha
                </p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Optimizer</p>
                <p className="text-3xl font-bold text-green-400">SLSQP</p>
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg" style={{ height: '450px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="bg-blue-900/20 border border-blue-700 text-blue-300 px-4 py-3 rounded-lg">
              <p className="text-sm">
                ✅ <strong>Real Qiskit VQE:</strong> Each point is a real quantum circuit evaluation with SLSQP optimizer
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Final Results */}
      {finalResults && (
        <Card title="✓ Simulation Complete - Final Results" icon={FiCheckCircle}>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 rounded-lg border-2 border-blue-600">
                <p className="text-gray-300 text-sm mb-2">VQE Ground State Energy</p>
                <p className="text-4xl font-bold text-blue-400">
                  {finalResults.vqe_energy?.toFixed(6)} Ha
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-6 rounded-lg border-2 border-green-600">
                <p className="text-gray-300 text-sm mb-2">Classical HF Energy</p>
                <p className="text-4xl font-bold text-green-400">
                  {finalResults.classical_energy?.toFixed(6)} Ha
                </p>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-semibold">Energy Difference:</span>
                <span className="text-2xl font-bold text-purple-400">
                  {(finalResults.vqe_energy - finalResults.classical_energy).toFixed(6)} Ha
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-semibold">Relative Error:</span>
                <span className="text-2xl font-bold text-yellow-400">
                  {finalResults.error_percentage?.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-semibold">Total Iterations:</span>
                <span className="text-2xl font-bold text-blue-400">
                  {finalResults.num_iterations}
                </span>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-700 text-green-300 px-6 py-4 rounded-lg">
              <p className="font-semibold text-lg mb-2">✅ Quantum Simulation Complete!</p>
              <p className="text-sm">
                Successfully computed ground state energy using real Qiskit VQE algorithm with Hartree-Fock initialization,
                TwoLocal ansatz, and SLSQP optimizer. All {finalResults.num_iterations} iterations were actual quantum circuit evaluations.
              </p>
            </div>

            <button
              onClick={() => window.location.href = '#/results'}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <FiCheckCircle className="w-5 h-5" />
              <span>View Detailed Analysis →</span>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VQESimulationRealTime;
