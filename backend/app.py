"""
Flask Backend API for Quantum Molecule Energy Estimator
"""

from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
from quantum_engine import QuantumMoleculeEngine
from services.vqe_service import VQEService
from services.hamiltonian_service import HamiltonianService
from services.classical_service import ClassicalService
import numpy as np
import matplotlib.pyplot as plt
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
STATIC_DIR = 'static/plots'
HAMILTONIAN_DIR = 'hamiltonians'

os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(HAMILTONIAN_DIR, exist_ok=True)


@app.route('/api/molecules', methods=['GET'])
def get_molecules():
    """Get list of available molecules with their properties"""
    molecules = {
        'H2': {
            'name': 'H2',
            'full_name': 'Hydrogen Molecule',
            'formula': 'H₂',
            'description': 'The simplest diatomic molecule',
            'electrons': 2,
            'atoms': 2,
            'bond_length': 0.735,
            'basis': 'sto3g',
            'geometry': 'H 0.0 0.0 0.0; H 0.0 0.0 0.735',
            'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hydrogen_molecule.svg/320px-Hydrogen_molecule.svg.png'
        },
        'LiH': {
            'name': 'LiH',
            'full_name': 'Lithium Hydride',
            'formula': 'LiH',
            'description': 'Heteronuclear diatomic with ionic character',
            'electrons': 4,
            'atoms': 2,
            'bond_length': 1.596,
            'basis': 'sto3g',
            'geometry': 'Li 0.0 0.0 0.0; H 0.0 0.0 1.596',
            'image_url': 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=62714&t=l'
        }
    }
    
    return jsonify({
        'success': True,
        'molecules': list(molecules.values())
    })


@app.route('/api/molecule/<molecule_name>', methods=['GET'])
def get_molecule_info(molecule_name):
    """Get detailed information about a specific molecule"""
    try:
        engine = QuantumMoleculeEngine(molecule_name)
        info = engine.get_molecule_info()
        
        return jsonify({
            'success': True,
            'molecule': info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/hamiltonian/<molecule_name>', methods=['GET'])
def get_hamiltonian(molecule_name):
    """Get Hamiltonian for a molecule"""
    try:
        result = HamiltonianService.load_hamiltonian(molecule_name, HAMILTONIAN_DIR)
        
        if result['success']:
            return jsonify({
                'success': True,
                'molecule': molecule_name,
                'hamiltonian': result['data']
            })
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/circuit/<molecule_name>', methods=['GET'])
def get_circuit(molecule_name):
    """Generate and return circuit diagram"""
    try:
        engine = QuantumMoleculeEngine(molecule_name)
        engine.build_hamiltonian()
        
        circuit_path = os.path.join(STATIC_DIR, f'{molecule_name}_circuit.png')
        result = engine.generate_circuit_image(circuit_path)
        
        if result['success']:
            return jsonify({
                'success': True,
                'circuit_url': f'/static/plots/{molecule_name}_circuit.png'
            })
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/run-vqe/<molecule_name>', methods=['POST'])
def run_vqe(molecule_name):
    """Run VQE simulation for a molecule"""
    try:
        result = VQEService.run_simulation(molecule_name, STATIC_DIR)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/theory/<molecule_name>', methods=['GET'])
def get_theory(molecule_name):
    """Get theory explanation for a molecule"""
    theories = {
        'H2': {
            'molecule': 'Hydrogen (H₂)',
            'why_important': 'The simplest molecule in nature, perfect for validating quantum algorithms.',
            'chemistry': 'Two hydrogen atoms share electrons in a covalent bond. Ground state energy determines bond stability.',
            'vqe_approach': 'VQE uses a parameterized quantum circuit (ansatz) to prepare trial states. The circuit parameters are optimized classically to minimize energy expectation value.',
            'hamiltonian': 'The molecular Hamiltonian is mapped to qubit operators using Jordan-Wigner transformation, converting fermionic operators to Pauli matrices.',
            'convergence': 'Typically converges in 20-50 iterations with SLSQP optimizer, reaching chemical accuracy (~1 kcal/mol).'
        },
        'LiH': {
            'molecule': 'Lithium Hydride (LiH)',
            'why_important': 'Demonstrates VQE capability for heteronuclear molecules with more complex electronic structure.',
            'chemistry': 'Ionic character with electron transfer from Li to H. More electrons mean richer electronic correlation.',
            'vqe_approach': 'Requires more qubits and deeper circuits than H₂. The ansatz must capture both ionic and covalent character.',
            'hamiltonian': 'Contains more Pauli terms due to increased electron interactions. Active space reduction often used for efficiency.',
            'convergence': 'May require 50-100 iterations due to more complex energy landscape and higher dimensionality.'
        }
    }
    
    theory = theories.get(molecule_name, theories['H2'])
    
    return jsonify({
        'success': True,
        'theory': theory
    })


@app.route('/static/plots/<filename>', methods=['GET'])
def serve_plot(filename):
    """Serve generated plot images"""
    filepath = os.path.join(STATIC_DIR, filename)
    
    if os.path.exists(filepath):
        return send_file(filepath, mimetype='image/png')
    else:
        return jsonify({
            'success': False,
            'error': 'File not found'
        }), 404


@app.route('/api/multi-optimizer/<molecule_name>', methods=['POST'])
def run_multi_optimizer(molecule_name):
    """Run VQE with multiple optimizers for comparison"""
    try:
        engine = QuantumMoleculeEngine(molecule_name)
        engine.build_hamiltonian()
        
        result = engine.run_multi_optimizer_vqe(max_iter=100)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/bond-scan/<molecule_name>', methods=['POST'])
def bond_length_scan(molecule_name):
    """Scan potential energy surface by varying bond length"""
    try:
        data = request.get_json() or {}
        start = data.get('start', 0.5)
        end = data.get('end', 2.0)
        steps = data.get('steps', 10)
        
        engine = QuantumMoleculeEngine(molecule_name)
        result = engine.scan_bond_length(start=start, end=end, steps=steps)
        
        if result['success']:
            # Generate PES plot
            plt.figure(figsize=(10, 6))
            plt.plot(result['bond_lengths'], result['classical_energies'], 
                    'r-o', label='Classical (HF)', linewidth=2, markersize=6)
            plt.plot(result['bond_lengths'], result['vqe_energies'], 
                    'b-s', label='VQE', linewidth=2, markersize=6)
            plt.xlabel('Bond Length (Å)', fontsize=12, fontweight='bold')
            plt.ylabel('Energy (Hartree)', fontsize=12, fontweight='bold')
            plt.title(f'Potential Energy Surface - {molecule_name}', fontsize=14, fontweight='bold')
            plt.legend(fontsize=11)
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            pes_path = os.path.join(STATIC_DIR, f'{molecule_name}_pes.png')
            plt.savefig(pes_path, dpi=150, bbox_inches='tight')
            plt.close()
            
            result['pes_plot'] = f'/static/plots/{molecule_name}_pes.png'
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/advanced-analytics/<molecule_name>', methods=['POST'])
def advanced_analytics(molecule_name):
    """Get advanced analytics for VQE simulation"""
    try:
        data = request.get_json() or {}
        iterations = data.get('iterations', [])
        
        if not iterations:
            return jsonify({
                'success': False,
                'error': 'No iteration data provided'
            }), 400
        
        energies = [item['energy'] for item in iterations]
        
        # Calculate analytics
        analytics = {
            'mean_energy': float(np.mean(energies)),
            'std_deviation': float(np.std(energies)),
            'variance': float(np.var(energies)),
            'min_energy': float(np.min(energies)),
            'max_energy': float(np.max(energies)),
            'energy_range': float(np.max(energies) - np.min(energies)),
            'convergence_rate': None,
            'final_gradient': None
        }
        
        # Calculate convergence rate (last 10% of iterations)
        if len(energies) > 10:
            last_10_percent = energies[-len(energies)//10:]
            analytics['convergence_rate'] = float(np.std(last_10_percent))
            
        # Estimate gradient
        if len(energies) > 2:
            analytics['final_gradient'] = float(energies[-1] - energies[-2])
        
        return jsonify({
            'success': True,
            'analytics': analytics
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'Quantum Molecule Energy Estimator API',
        'version': '1.0.0'
    })


if __name__ == '__main__':
    print("🚀 Starting Quantum Molecule Energy Estimator API...")
    print("📡 Backend running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
