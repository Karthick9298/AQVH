"""
VQE Service - Handles VQE computations
"""

from quantum_engine import QuantumMoleculeEngine
import os


class VQEService:
    """Service for running VQE simulations"""
    
    @staticmethod
    def run_simulation(molecule_name, output_dir='static/plots', max_iter=100):
        """Run complete VQE simulation"""
        engine = QuantumMoleculeEngine(molecule_name)
        
        # Build Hamiltonian
        ham_result = engine.build_hamiltonian()
        if not ham_result['success']:
            return {'success': False, 'error': ham_result['error']}
        
        # Run VQE
        vqe_result = engine.run_vqe(max_iter=max_iter)
        if not vqe_result['success']:
            return {'success': False, 'error': vqe_result['error']}
        
        # Generate plots
        os.makedirs(output_dir, exist_ok=True)
        
        circuit_path = os.path.join(output_dir, f'{molecule_name}_circuit.png')
        energy_path = os.path.join(output_dir, f'{molecule_name}_energy.png')
        
        engine.generate_circuit_image(circuit_path)
        engine.generate_energy_plot(energy_path)
        
        return {
            'success': True,
            'molecule': molecule_name,
            'vqe_energy': vqe_result['vqe_energy'],
            'classical_energy': vqe_result['classical_energy'],
            'num_iterations': vqe_result['num_iterations'],
            'iterations': vqe_result['iterations'],
            'circuit_image': f'/static/plots/{molecule_name}_circuit.png',
            'energy_plot': f'/static/plots/{molecule_name}_energy.png',
            'error_percentage': abs((vqe_result['vqe_energy'] - vqe_result['classical_energy']) / vqe_result['classical_energy'] * 100)
        }
