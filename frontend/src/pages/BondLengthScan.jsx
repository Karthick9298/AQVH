import React, { useState } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { FiActivity, FiTarget } from 'react-icons/fi';

const BondLengthScan = () => {
  const [selectedMolecule, setSelectedMolecule] = useState('H2');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [params, setParams] = useState({
    start: 0.5,
    end: 2.0,
    steps: 10
  });

  const runScan = async () => {
    setScanning(true);
    try {
      const response = await api.bondScan(selectedMolecule, params);
      setResults(response.data);
    } catch (error) {
      console.error('Error running bond scan:', error);
      alert('Error running bond length scan');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Potential Energy Surface</h1>
        <p className="text-gray-400 text-lg">Scan energy across different bond lengths</p>
      </div>

      <Card title="Scan Parameters" icon={FiTarget}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Molecule
            </label>
            <select
              value={selectedMolecule}
              onChange={(e) => setSelectedMolecule(e.target.value)}
              disabled={scanning}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="H2">Hydrogen (H₂)</option>
              <option value="LiH">Lithium Hydride (LiH)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Start (Å)
              </label>
              <input
                type="number"
                step="0.1"
                value={params.start}
                onChange={(e) => setParams({...params, start: parseFloat(e.target.value)})}
                disabled={scanning}
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                End (Å)
              </label>
              <input
                type="number"
                step="0.1"
                value={params.end}
                onChange={(e) => setParams({...params, end: parseFloat(e.target.value)})}
                disabled={scanning}
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Steps
              </label>
              <input
                type="number"
                value={params.steps}
                onChange={(e) => setParams({...params, steps: parseInt(e.target.value)})}
                disabled={scanning}
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={runScan}
            disabled={scanning}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? 'Scanning...' : 'Run Bond Length Scan'}
          </button>
        </div>
      </Card>

      {scanning && <LoadingSpinner message={`Scanning ${params.steps} bond lengths...`} />}

      {results && !scanning && (
        <>
          <Card title="Equilibrium Bond Length" icon={FiActivity}>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 p-6 rounded-lg border border-green-700 text-center">
                <div className="text-sm text-gray-400 mb-2">Predicted Equilibrium</div>
                <div className="text-5xl font-bold text-green-400 mb-2">
                  {results.equilibrium_bond_length.toFixed(3)}
                </div>
                <div className="text-lg text-gray-300">Ångströms</div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Min Classical Energy</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.min(...results.classical_energies).toFixed(6)} Ha
                  </div>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Min VQE Energy</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.min(...results.vqe_energies.filter(e => e !== null)).toFixed(6)} Ha
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Potential Energy Surface">
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">PES Analysis:</span> The potential energy surface shows how molecular energy varies with bond length. The minimum represents the equilibrium geometry where the molecule is most stable.
                </p>
              </div>

              {results.pes_plot && (
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <img
                    src={api.getStaticUrl(results.pes_plot)}
                    alt="Potential Energy Surface"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Bond Length (Å)</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Classical (Ha)</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">VQE (Ha)</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.bond_lengths.map((length, idx) => (
                      <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-blue-400 font-mono">{length.toFixed(3)}</td>
                        <td className="py-3 px-4 text-right text-green-400 font-mono">
                          {results.classical_energies[idx].toFixed(6)}
                        </td>
                        <td className="py-3 px-4 text-right text-purple-400 font-mono">
                          {results.vqe_energies[idx] ? results.vqe_energies[idx].toFixed(6) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right text-yellow-400 font-mono">
                          {results.vqe_energies[idx] 
                            ? (results.vqe_energies[idx] - results.classical_energies[idx]).toFixed(6)
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card title="Physical Insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-4 rounded-lg border border-blue-700">
                <h4 className="font-semibold text-blue-300 mb-2">💡 Chemical Significance</h4>
                <p className="text-sm text-gray-300">
                  The equilibrium bond length represents the optimal distance where attractive and repulsive forces balance. Deviations increase system energy, making the molecule less stable.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-4 rounded-lg border border-purple-700">
                <h4 className="font-semibold text-purple-300 mb-2">🔬 Quantum Accuracy</h4>
                <p className="text-sm text-gray-300">
                  VQE approximates the full quantum mechanical solution, capturing electron correlation effects that classical methods miss, especially near equilibrium.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 p-4 rounded-lg border border-green-700">
                <h4 className="font-semibold text-green-300 mb-2">📊 PES Applications</h4>
                <p className="text-sm text-gray-300">
                  Potential energy surfaces are used to predict reaction pathways, transition states, and vibrational frequencies—key for drug design and catalysis.
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 p-4 rounded-lg border border-yellow-700">
                <h4 className="font-semibold text-yellow-300 mb-2">⚙️ Computational Cost</h4>
                <p className="text-sm text-gray-300">
                  Each point requires a full VQE optimization. Scanning {params.steps} points demonstrates the computational advantage of quantum algorithms at scale.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default BondLengthScan;
