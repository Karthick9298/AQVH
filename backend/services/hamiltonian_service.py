"""
Hamiltonian Service - Handles Hamiltonian generation and storage
"""

from quantum_engine import QuantumMoleculeEngine
import json
import os


class HamiltonianService:
    """Service for managing molecular Hamiltonians"""
    
    @staticmethod
    def generate_and_save(molecule_name, output_dir='hamiltonians'):
        """Generate Hamiltonian and save to JSON"""
        engine = QuantumMoleculeEngine(molecule_name)
        
        result = engine.build_hamiltonian()
        if not result['success']:
            return result
        
        # Save to JSON
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, f'{molecule_name}_hamiltonian.json')
        
        with open(filepath, 'w') as f:
            json.dump(result, f, indent=2)
        
        return {
            'success': True,
            'filepath': filepath,
            'data': result
        }
    
    @staticmethod
    def load_hamiltonian(molecule_name, input_dir='hamiltonians'):
        """Load precomputed Hamiltonian"""
        filepath = os.path.join(input_dir, f'{molecule_name}_hamiltonian.json')
        
        if not os.path.exists(filepath):
            # Generate if not exists
            return HamiltonianService.generate_and_save(molecule_name, input_dir)
        
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        return {'success': True, 'data': data}
