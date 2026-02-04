import React, { useState } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { FiTrendingUp, FiZap, FiBarChart } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';

const OptimizerComparison = () => {
  const [selectedMolecule, setSelectedMolecule] = useState('H2');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runComparison = async () => {
    setRunning(true);
    try {
      const response = await api.runMultiOptimizer(selectedMolecule);
      setResults(response.data);
    } catch (error) {
      console.error('Error running comparison:', error);
      alert('Error running optimizer comparison');
    } finally {
      setRunning(false);
    }
  };

  const getChartData = () => {
    if (!results) return null;

    const colors = {
      'SLSQP': 'rgb(59, 130, 246)',
      'COBYLA': 'rgb(168, 85, 247)',
      'SPSA': 'rgb(16, 185, 129)'
    };

    const datasets = Object.keys(results.optimizers).map(optName => ({
      label: optName,
      data: results.optimizers[optName].iterations.map(item => item.energy),
      borderColor: colors[optName],
      backgroundColor: colors[optName].replace('rgb', 'rgba').replace(')', ', 0.1)'),
      tension: 0.4,
      pointRadius: 3
    }));

    // Add classical energy line
    const maxLength = Math.max(...datasets.map(d => d.data.length));
    datasets.push({
      label: 'Classical (HF)',
      data: Array(maxLength).fill(results.classical_energy),
      borderColor: 'rgb(239, 68, 68)',
      borderDash: [5, 5],
      pointRadius: 0
    });

    return {
      labels: Array.from({length: maxLength}, (_, i) => i + 1),
      datasets
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(156, 163, 175)',
          font: { size: 12, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: 'Optimizer Comparison',
        color: 'rgb(255, 255, 255)',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Iteration', color: 'rgb(156, 163, 175)' },
        ticks: { color: 'rgb(156, 163, 175)' },
        grid: { color: 'rgba(75, 85, 99, 0.3)' }
      },
      y: {
        title: { display: true, text: 'Energy (Hartree)', color: 'rgb(156, 163, 175)' },
        ticks: { color: 'rgb(156, 163, 175)' },
        grid: { color: 'rgba(75, 85, 99, 0.3)' }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Optimizer Comparison</h1>
        <p className="text-gray-400 text-lg">Compare SLSQP, COBYLA, and SPSA optimizers</p>
      </div>

      <Card title="Run Comparison" icon={FiZap}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Select Molecule
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

          <button
            onClick={runComparison}
            disabled={running}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Running Comparison...' : 'Run Multi-Optimizer VQE'}
          </button>
        </div>
      </Card>

      {running && <LoadingSpinner message="Running VQE with 3 optimizers..." />}

      {results && !running && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(results.optimizers).map((optName) => {
              const opt = results.optimizers[optName];
              const error = Math.abs((opt.energy - results.classical_energy) / results.classical_energy * 100);
              
              return (
                <Card key={optName} title={optName}>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-1">
                        {opt.energy.toFixed(6)}
                      </div>
                      <div className="text-xs text-gray-400">Ha</div>
                    </div>
                    
                    <div className="bg-gray-900 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Iterations:</span>
                        <span className="text-white font-semibold">{opt.num_iterations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Error:</span>
                        <span className="text-yellow-400 font-semibold">{error.toFixed(4)}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card title="Convergence Comparison" icon={FiTrendingUp}>
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">Analysis:</span> Compare convergence behavior of gradient-based (SLSQP), derivative-free (COBYLA), and stochastic (SPSA) optimizers. Each has different strengths for quantum optimization landscapes.
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" style={{ height: '400px' }}>
                {getChartData() && <Line data={getChartData()} options={chartOptions} />}
              </div>
            </div>
          </Card>

          <Card title="Optimizer Characteristics" icon={FiBarChart}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-4 rounded-lg border border-blue-700">
                <h4 className="font-semibold text-blue-300 mb-2">SLSQP</h4>
                <p className="text-sm text-gray-300 mb-2">Sequential Least Squares Programming</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Gradient-based optimization</li>
                  <li>• Fast convergence for smooth landscapes</li>
                  <li>• Requires gradient calculations</li>
                  <li>• Best for well-behaved problems</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-4 rounded-lg border border-purple-700">
                <h4 className="font-semibold text-purple-300 mb-2">COBYLA</h4>
                <p className="text-sm text-gray-300 mb-2">Constrained Optimization BY Linear Approximation</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Derivative-free method</li>
                  <li>• Robust to noisy landscapes</li>
                  <li>• Handles constraints well</li>
                  <li>• Slower but more stable</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 p-4 rounded-lg border border-green-700">
                <h4 className="font-semibold text-green-300 mb-2">SPSA</h4>
                <p className="text-sm text-gray-300 mb-2">Simultaneous Perturbation Stochastic Approximation</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Stochastic gradient estimation</li>
                  <li>• Efficient for high dimensions</li>
                  <li>• Resilient to noise</li>
                  <li>• Suitable for hardware experiments</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card title="Winner Analysis">
            <div className="space-y-4">
              {(() => {
                const best = Object.keys(results.optimizers).reduce((best, current) => {
                  const bestEnergy = results.optimizers[best].energy;
                  const currentEnergy = results.optimizers[current].energy;
                  return currentEnergy < bestEnergy ? current : best;
                });

                const fastest = Object.keys(results.optimizers).reduce((fastest, current) => {
                  const fastestIter = results.optimizers[fastest].num_iterations;
                  const currentIter = results.optimizers[current].num_iterations;
                  return currentIter < fastestIter ? current : fastest;
                });

                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <div className="text-lg font-bold text-green-400 mb-2">🏆 Lowest Energy</div>
                      <div className="text-3xl font-bold text-white">{best}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {results.optimizers[best].energy.toFixed(6)} Ha
                      </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                      <div className="text-lg font-bold text-yellow-400 mb-2">⚡ Fastest Convergence</div>
                      <div className="text-3xl font-bold text-white">{fastest}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {results.optimizers[fastest].num_iterations} iterations
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default OptimizerComparison;
