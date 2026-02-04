import React from 'react';
import Card from '../components/Card';
import { FiActivity, FiCpu, FiZap, FiTrendingUp } from 'react-icons/fi';

const Overview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Quantum Molecule Energy Estimator</h1>
        <p className="text-gray-400 text-lg">VQE-based Ground State Energy Calculation Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="What is VQE?" icon={FiZap}>
          <div className="space-y-3 text-gray-300">
            <p>
              <span className="font-semibold text-blue-400">Variational Quantum Eigensolver (VQE)</span> is a hybrid quantum-classical algorithm designed to find the ground state energy of molecular systems.
            </p>
            <p>
              It combines quantum circuits for state preparation with classical optimization to minimize the energy expectation value.
            </p>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
              <p className="text-sm font-mono text-blue-300">
                E_ground = min ⟨ψ(θ)|H|ψ(θ)⟩
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Where θ are variational parameters optimized classically
              </p>
            </div>
          </div>
        </Card>

        <Card title="Ground State Energy" icon={FiActivity}>
          <div className="space-y-3 text-gray-300">
            <p>
              The <span className="font-semibold text-purple-400">ground state energy</span> is the lowest possible energy of a quantum system, determining molecular stability and chemical properties.
            </p>
            <p>
              Accurate prediction enables:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Drug discovery and molecular design</li>
              <li>Material science applications</li>
              <li>Chemical reaction prediction</li>
              <li>Catalyst optimization</li>
            </ul>
          </div>
        </Card>

        <Card title="System Workflow" icon={FiCpu} className="md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🧬</div>
                <div className="font-semibold text-white">Molecular Input</div>
                <div className="text-xs text-blue-100 mt-1">H₂, LiH geometry</div>
              </div>
              
              <div className="text-2xl text-gray-600">→</div>
              
              <div className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">⚛️</div>
                <div className="font-semibold text-white">Hamiltonian</div>
                <div className="text-xs text-purple-100 mt-1">Jordan-Wigner mapping</div>
              </div>
              
              <div className="text-2xl text-gray-600">→</div>
              
              <div className="flex-1 bg-gradient-to-r from-green-600 to-green-500 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-semibold text-white">VQE Optimization</div>
                <div className="text-xs text-green-100 mt-1">Quantum circuit</div>
              </div>
              
              <div className="text-2xl text-gray-600">→</div>
              
              <div className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-white">Results</div>
                <div className="text-xs text-orange-100 mt-1">Ground state energy</div>
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-yellow-400">Key Innovation:</span> Hybrid approach leverages quantum hardware for state preparation while classical computers handle optimization, making it suitable for near-term quantum devices (NISQ era).
              </p>
            </div>
          </div>
        </Card>

        <Card title="Technologies Used" icon={FiTrendingUp} className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-2">⚛️</div>
              <div className="font-semibold text-white">Qiskit</div>
              <div className="text-xs text-gray-400 mt-1">Quantum Framework</div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-2">⚗️</div>
              <div className="font-semibold text-white">PySCF</div>
              <div className="text-xs text-gray-400 mt-1">Classical Chemistry</div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold text-white">Flask</div>
              <div className="text-xs text-gray-400 mt-1">Backend API</div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-2">⚛️</div>
              <div className="font-semibold text-white">React</div>
              <div className="text-xs text-gray-400 mt-1">Frontend UI</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-2">🚀 New Advanced Features!</h3>
        <p className="text-blue-100 mb-4">
          Explore cutting-edge quantum chemistry capabilities that set this platform apart:
        </p>
        <ul className="space-y-2 text-blue-100">
          <li>• <span className="font-semibold">Multi-Optimizer Comparison</span> - Compare SLSQP, COBYLA, and SPSA side-by-side</li>
          <li>• <span className="font-semibold">Potential Energy Surface Scanning</span> - Map energy landscapes across bond lengths</li>
          <li>• <span className="font-semibold">Advanced Analytics</span> - Deep dive into convergence metrics and statistics</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-2">Ready to Explore?</h3>
        <p className="text-green-100">
          Navigate through the sidebar to explore molecules, view Hamiltonians, run VQE simulations, and analyze results. This platform demonstrates the power of quantum computing for molecular chemistry with research-grade features.
        </p>
      </div>
    </div>
  );
};

export default Overview;
