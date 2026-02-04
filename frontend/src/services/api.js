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
  runVQE: (moleculeName, params = {}) => axios.post(`${API_BASE_URL}/run-vqe/${moleculeName}`, params, {
    headers: { 'Content-Type': 'application/json' }
  }),

  // Real-time VQE streaming with Server-Sent Events
  runVQEStream: (moleculeName, params, onMessage, onError, onComplete) => {
    // SSE only supports GET, so pass params via URL query string
    const maxIter = params?.max_iter || 100;
    const url = `${API_BASE_URL}/run-vqe-stream/${moleculeName}?max_iter=${maxIter}`;
    
    // Create EventSource for Server-Sent Events
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          onError(data.error);
          eventSource.close();
        } else if (data.step === 'results' && data.status === 'complete') {
          onMessage(data);
          onComplete(data.data);
          eventSource.close();
        } else {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        onError(error.message);
        eventSource.close();
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      onError('Connection to server lost');
      eventSource.close();
    };
    
    return eventSource; // Return EventSource so caller can close if needed
  },

  // Get theory
  getTheory: (moleculeName) => axios.get(`${API_BASE_URL}/theory/${moleculeName}`),

  // Run multi-optimizer comparison
  runMultiOptimizer: (moleculeName, params = {}) => axios.post(`${API_BASE_URL}/multi-optimizer/${moleculeName}`, params, {
    headers: { 'Content-Type': 'application/json' }
  }),

  // Run bond length scan
  bondScan: (moleculeName, params) => axios.post(`${API_BASE_URL}/bond-scan/${moleculeName}`, params, {
    headers: { 'Content-Type': 'application/json' }
  }),

  // Get advanced analytics
  getAnalytics: (moleculeName, iterations) => axios.post(`${API_BASE_URL}/advanced-analytics/${moleculeName}`, { iterations }, {
    headers: { 'Content-Type': 'application/json' }
  }),

  // Compare molecules
  compareMolecules: (molecules) => axios.post(`${API_BASE_URL}/compare-molecules`, { molecules }, {
    headers: { 'Content-Type': 'application/json' }
  }),

  // Export results
  exportResults: (data) => axios.post(`${API_BASE_URL}/export-results`, data, {
    headers: { 'Content-Type': 'application/json' }
  }),

  // Get static file URL
  getStaticUrl: (path) => `http://localhost:5000${path}`
};

export default api;
