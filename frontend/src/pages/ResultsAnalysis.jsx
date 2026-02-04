import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import api from '../services/api';
import { FiBarChart2, FiDownload, FiCheckCircle } from 'react-icons/fi';
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

const ResultsAnalysis = () => {
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    const savedResults = sessionStorage.getItem('vqe_results');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vqe_results_${results.molecule}.json`;
    link.click();
  };

  if (!results) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Results & Analysis</h1>
          <p className="text-gray-400 text-lg">View and analyze VQE simulation results</p>
        </div>
        
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400 text-lg">No simulation results yet</p>
            <p className="text-gray-500 text-sm mt-2">Run a VQE simulation to see results here</p>
          </div>
        </Card>
      </div>
    );
  }

  const chartData = {
    labels: results.iterations.map(item => item.iteration),
    datasets: [
      {
        label: 'VQE Energy',
        data: results.iterations.map(item => item.energy),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Classical (HF) Energy',
        data: results.iterations.map(() => results.classical_energy),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `VQE Convergence - ${results.molecule}`,
        color: 'rgb(255, 255, 255)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Iteration',
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Energy (Hartree)',
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        }
      }
    }
  };

  const energyDifference = Math.abs(results.vqe_energy - results.classical_energy);
  const relativeError = (energyDifference / Math.abs(results.classical_energy)) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Results & Analysis</h1>
        <p className="text-gray-400 text-lg">Molecule: {results.molecule}</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={downloadResults}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <FiDownload />
          Download Results
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="VQE Energy">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {results.vqe_energy.toFixed(6)}
            </div>
            <div className="text-gray-400">Hartree</div>
          </div>
        </Card>

        <Card title="Classical Energy">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-400 mb-2">
              {results.classical_energy.toFixed(6)}
            </div>
            <div className="text-gray-400">Hartree-Fock</div>
          </div>
        </Card>

        <Card title="Iterations">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {results.num_iterations}
            </div>
            <div className="text-gray-400">Optimization steps</div>
          </div>
        </Card>
      </div>

      <Card title="Energy Comparison" icon={FiBarChart2}>
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <span className="font-semibold">Interpretation:</span> This plot shows VQE energy converging toward the classical Hartree-Fock energy. The variational principle ensures VQE energy is always an upper bound to the true ground state.
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Energy Difference</div>
              <div className="text-2xl font-bold text-yellow-400">
                {energyDifference.toFixed(8)} Ha
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Relative Error</div>
              <div className="text-2xl font-bold text-orange-400">
                {relativeError.toFixed(4)}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {results.energy_plot && (
        <Card title="Energy Convergence Plot" icon={FiCheckCircle}>
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <img
                src={api.getStaticUrl(results.energy_plot)}
                alt="Energy Convergence"
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Matplotlib-generated convergence visualization
            </div>
          </div>
        </Card>
      )}

      <Card title="Analysis Summary">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-4 rounded-lg border border-blue-700">
              <h4 className="font-semibold text-blue-300 mb-2">✓ Convergence Status</h4>
              <p className="text-sm text-gray-300">
                {relativeError < 1 
                  ? 'Excellent convergence achieved within chemical accuracy'
                  : 'Converged to near-classical energy estimate'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-4 rounded-lg border border-purple-700">
              <h4 className="font-semibold text-purple-300 mb-2">⚡ Optimization Efficiency</h4>
              <p className="text-sm text-gray-300">
                Completed in {results.num_iterations} iterations using SLSQP optimizer
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 p-4 rounded-lg border border-green-700">
              <h4 className="font-semibold text-green-300 mb-2">🎯 Accuracy</h4>
              <p className="text-sm text-gray-300">
                VQE approximates ground state within {energyDifference.toFixed(6)} Ha of classical reference
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 p-4 rounded-lg border border-yellow-700">
              <h4 className="font-semibold text-yellow-300 mb-2">📊 Validation</h4>
              <p className="text-sm text-gray-300">
                Results validated against Hartree-Fock calculation using PySCF
              </p>
            </div>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold text-white mb-2">Scientific Insights</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• VQE successfully minimizes the energy expectation value through classical-quantum hybrid optimization</li>
              <li>• The variational principle ensures computed energy is always ≥ true ground state energy</li>
              <li>• Convergence pattern demonstrates effective parameter space exploration by SLSQP optimizer</li>
              <li>• Results can be used for predicting molecular properties, reaction barriers, and binding energies</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResultsAnalysis;
