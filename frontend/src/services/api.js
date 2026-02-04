import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Health check
  healthCheck: () => axios.get(`${API_BASE_URL}/health`),

  // Get all molecules
  getMolecules: () => axios.get(`${API_BASE_URL}/molecules`),

  // Get specific molecule info
  getMoleculeInfo: (moleculeName) => axios.get(`${API_BASE_URL}/molecule/${moleculeName}`),

  // Get Hamiltonian
  getHamiltonian: (moleculeName) => axios.get(`${API_BASE_URL}/hamiltonian/${moleculeName}`),

  // Get circuit diagram
  getCircuit: (moleculeName) => axios.get(`${API_BASE_URL}/circuit/${moleculeName}`),

  // Run VQE simulation
  runVQE: (moleculeName) => axios.post(`${API_BASE_URL}/run-vqe/${moleculeName}`),

  // Get theory
  getTheory: (moleculeName) => axios.get(`${API_BASE_URL}/theory/${moleculeName}`),

  // Run multi-optimizer comparison
  runMultiOptimizer: (moleculeName) => axios.post(`${API_BASE_URL}/multi-optimizer/${moleculeName}`),

  // Run bond length scan
  bondScan: (moleculeName, params) => axios.post(`${API_BASE_URL}/bond-scan/${moleculeName}`, params),

  // Get advanced analytics
  getAnalytics: (moleculeName, iterations) => axios.post(`${API_BASE_URL}/advanced-analytics/${moleculeName}`, { iterations }),

  // Get static file URL
  getStaticUrl: (path) => `http://localhost:5000${path}`
};

export default api;
