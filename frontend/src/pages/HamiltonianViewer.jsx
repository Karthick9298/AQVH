import React, { useState } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { FiGrid, FiSearch } from 'react-icons/fi';

const HamiltonianViewer = () => {
  const [selectedMolecule, setSelectedMolecule] = useState('H2');
  const [hamiltonian, setHamiltonian] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadHamiltonian = async (moleculeName) => {
    setLoading(true);
    try {
      const response = await api.getHamiltonian(moleculeName);
      setHamiltonian(response.data.hamiltonian);
    } catch (error) {
      console.error('Error loading Hamiltonian:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoleculeChange = (e) => {
    const molecule = e.target.value;
    setSelectedMolecule(molecule);
    loadHamiltonian(molecule);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Hamiltonian Viewer</h1>
        <p className="text-gray-400 text-lg">Explore qubit Hamiltonians and Pauli decompositions</p>
      </div>

      <Card title="Select Molecule" icon={FiSearch}>
        <div className="flex gap-4">
          <select
            value={selectedMolecule}
            onChange={handleMoleculeChange}
            className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="H2">Hydrogen (H₂)</option>
            <option value="LiH">Lithium Hydride (LiH)</option>
          </select>
          
          <button
            onClick={() => loadHamiltonian(selectedMolecule)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Load Hamiltonian
          </button>
        </div>
      </Card>

      {loading && <LoadingSpinner message="Generating Hamiltonian..." />}

      {hamiltonian && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Qubits Required">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 mb-2">
                  {hamiltonian.num_qubits}
                </div>
                <div className="text-gray-400">Quantum bits needed</div>
              </div>
            </Card>

            <Card title="Pauli Terms">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-400 mb-2">
                  {hamiltonian.num_terms}
                </div>
                <div className="text-gray-400">Total operators</div>
              </div>
            </Card>

            <Card title="Classical Energy">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {hamiltonian.classical_energy.toFixed(6)}
                </div>
                <div className="text-gray-400">Hartree-Fock (Ha)</div>
              </div>
            </Card>
          </div>

          <Card title="Pauli Decomposition" icon={FiGrid}>
            <div className="mb-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">Explanation:</span> The molecular Hamiltonian is mapped to qubit operators using the Jordan-Wigner transformation. Each Pauli term represents electron interactions in the qubit space.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">#</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Pauli Term</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Coefficient</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Physical Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {hamiltonian.pauli_terms.map((term, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-blue-400">{term.pauli}</td>
                      <td className="py-3 px-4 text-right font-mono text-green-400">
                        {term.coefficient.toFixed(6)}
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">{term.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Showing top 10 most significant terms (sorted by coefficient magnitude)
            </div>
          </Card>

          <Card title="Hamiltonian Theory">
            <div className="space-y-3 text-gray-300">
              <p>
                The molecular Hamiltonian H describes all energy contributions in the system:
              </p>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 font-mono text-sm text-center">
                <span className="text-blue-300">H = -∑ T_i - ∑ V_ne + ∑ V_ee + V_nn</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li><span className="text-blue-400 font-semibold">T_i:</span> Kinetic energy of electrons</li>
                <li><span className="text-purple-400 font-semibold">V_ne:</span> Nuclear-electron attraction</li>
                <li><span className="text-green-400 font-semibold">V_ee:</span> Electron-electron repulsion</li>
                <li><span className="text-yellow-400 font-semibold">V_nn:</span> Nuclear-nuclear repulsion (constant)</li>
              </ul>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default HamiltonianViewer;
