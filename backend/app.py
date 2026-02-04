"""
Flask Backend API for Quantum Molecule Energy Estimator
Enhanced with comprehensive error handling, validation, logging, and performance optimizations
"""

from flask import Flask, jsonify, send_file, request, Response, stream_with_context
from flask_cors import CORS
from quantum_engine import QuantumMoleculeEngine
from services.vqe_service import VQEService
from services.hamiltonian_service import HamiltonianService
from services.classical_service import ClassicalService
import numpy as np
import matplotlib.pyplot as plt
import os
import logging
from datetime import datetime
from functools import wraps
import time
import json
from queue import Queue
from threading import Thread

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
STATIC_DIR = 'static/plots'
HAMILTONIAN_DIR = 'hamiltonians'
CACHE_DIR = 'cache'

os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(HAMILTONIAN_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

# Supported molecules configuration
SUPPORTED_MOLECULES = ['H2', 'LiH']
MAX_ITERATIONS_LIMIT = 500
MIN_ITERATIONS = 10


# Decorators for enhanced functionality
def log_request(f):
    """Decorator to log API requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")
        try:
            result = f(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"Completed: {request.path} in {duration:.2f}s")
            return result
        except Exception as e:
            logger.error(f"Error in {request.path}: {str(e)}", exc_info=True)
            raise
    return decorated_function


def validate_molecule(f):
    """Decorator to validate molecule name"""
    @wraps(f)
    def decorated_function(molecule_name, *args, **kwargs):
        if molecule_name not in SUPPORTED_MOLECULES:
            return jsonify({
                'success': False,
                'error': f'Unsupported molecule: {molecule_name}. Supported: {SUPPORTED_MOLECULES}'
            }), 400
        return f(molecule_name, *args, **kwargs)
    return decorated_function


def handle_errors(f):
    """Decorator for consistent error handling"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            logger.warning(f"Validation error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 400
        except FileNotFoundError as e:
            logger.error(f"File not found: {str(e)}")
            return jsonify({'success': False, 'error': 'Resource not found'}), 404
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return jsonify({'success': False, 'error': 'Internal server error'}), 500
    return decorated_function


@app.route('/api/molecules', methods=['GET'])
@log_request
@handle_errors
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
            'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hydrogen_molecule.svg/320px-Hydrogen_molecule.svg.png',
            'dissociation_energy': 4.52,
            'point_group': 'D∞h',
            'dipole_moment': 0.0
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
            'image_url': 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=62714&t=l',
            'dissociation_energy': 2.43,
            'point_group': 'C∞v',
            'dipole_moment': 5.88
        }
    }
    
    return jsonify({
        'success': True,
        'molecules': list(molecules.values()),
        'count': len(molecules)
    })


@app.route('/api/molecule/<molecule_name>', methods=['GET'])
@log_request
@validate_molecule
@handle_errors
def get_molecule_info(molecule_name):
    """Get detailed information about a specific molecule"""
    engine = QuantumMoleculeEngine(molecule_name)
    info = engine.get_molecule_info()
    
    return jsonify({
        'success': True,
        'molecule': info,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/hamiltonian/<molecule_name>', methods=['GET'])
@log_request
@validate_molecule
@handle_errors
def get_hamiltonian(molecule_name):
    """Get Hamiltonian for a molecule"""
    result = HamiltonianService.load_hamiltonian(molecule_name, HAMILTONIAN_DIR)
    
    if result['success']:
        return jsonify({
            'success': True,
            'molecule': molecule_name,
            'hamiltonian': result['data'],
            'timestamp': datetime.now().isoformat()
        })
    else:
        return jsonify(result), 400


@app.route('/api/circuit/<molecule_name>', methods=['GET'])
@log_request
@validate_molecule
@handle_errors
def get_circuit(molecule_name):
    """Generate and return circuit diagram"""
    engine = QuantumMoleculeEngine(molecule_name)
    engine.build_hamiltonian()
    
    circuit_path = os.path.join(STATIC_DIR, f'{molecule_name}_circuit.png')
    result = engine.generate_circuit_image(circuit_path)
    
    if result['success']:
        return jsonify({
            'success': True,
            'circuit_url': f'/static/plots/{molecule_name}_circuit.png',
            'timestamp': datetime.now().isoformat()
        })
    else:
        return jsonify(result), 400


@app.route('/api/run-vqe/<molecule_name>', methods=['POST'])
@log_request
@validate_molecule
@handle_errors
def run_vqe(molecule_name):
    """Run VQE simulation for a molecule"""
    # Get and validate parameters from request body
    data = request.get_json() or {}
    max_iter = data.get('max_iter', 100)
    
    # Validate max_iter
    if not isinstance(max_iter, int) or max_iter < MIN_ITERATIONS or max_iter > MAX_ITERATIONS_LIMIT:
        raise ValueError(f'max_iter must be between {MIN_ITERATIONS} and {MAX_ITERATIONS_LIMIT}')
    
    logger.info(f"Running VQE for {molecule_name} with max_iter={max_iter}")
    
    result = VQEService.run_simulation(molecule_name, STATIC_DIR, max_iter=max_iter)
    
    if result['success']:
        result['timestamp'] = datetime.now().isoformat()
        return jsonify(result)
    else:
        return jsonify(result), 400


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
@log_request
@validate_molecule
@handle_errors
def run_multi_optimizer(molecule_name):
    """Run VQE with multiple optimizers for comparison"""
    data = request.get_json() or {}
    max_iter = data.get('max_iter', 100)
    
    if not isinstance(max_iter, int) or max_iter < MIN_ITERATIONS or max_iter > MAX_ITERATIONS_LIMIT:
        raise ValueError(f'max_iter must be between {MIN_ITERATIONS} and {MAX_ITERATIONS_LIMIT}')
    
    logger.info(f"Running multi-optimizer comparison for {molecule_name}")
    
    engine = QuantumMoleculeEngine(molecule_name)
    engine.build_hamiltonian()
    
    result = engine.run_multi_optimizer_vqe(max_iter=max_iter)
    
    if result['success']:
        result['timestamp'] = datetime.now().isoformat()
        return jsonify(result)
    else:
        return jsonify(result), 400


@app.route('/api/bond-scan/<molecule_name>', methods=['POST'])
@log_request
@validate_molecule
@handle_errors
def bond_length_scan(molecule_name):
    """Scan potential energy surface by varying bond length"""
    data = request.get_json() or {}
    start = data.get('start', 0.5)
    end = data.get('end', 2.0)
    steps = data.get('steps', 10)
    
    # Validation
    if not (0.1 <= start <= end <= 5.0):
        raise ValueError('Invalid bond length range. Must be between 0.1 and 5.0 Å')
    if not (2 <= steps <= 50):
        raise ValueError('Steps must be between 2 and 50')
    
    logger.info(f"Running bond scan for {molecule_name}: {start}-{end} Å in {steps} steps")
    
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
        result['timestamp'] = datetime.now().isoformat()
        return jsonify(result)
    else:
        return jsonify(result), 400


@app.route('/api/advanced-analytics/<molecule_name>', methods=['POST'])
@log_request
@validate_molecule
@handle_errors
def advanced_analytics(molecule_name):
    """Get advanced analytics for VQE simulation"""
    data = request.get_json() or {}
    iterations = data.get('iterations', [])
    
    if not iterations:
        raise ValueError('No iteration data provided')
    
    energies = [item['energy'] for item in iterations]
    
    # Calculate comprehensive analytics
    analytics = {
        'mean_energy': float(np.mean(energies)),
        'std_deviation': float(np.std(energies)),
        'variance': float(np.var(energies)),
        'min_energy': float(np.min(energies)),
        'max_energy': float(np.max(energies)),
        'energy_range': float(np.max(energies) - np.min(energies)),
        'convergence_rate': None,
        'final_gradient': None,
        'median_energy': float(np.median(energies)),
        'energy_improvement': None
    }
    
    # Calculate convergence rate (last 10% of iterations)
    if len(energies) > 10:
        last_10_percent = energies[-len(energies)//10:]
        analytics['convergence_rate'] = float(np.std(last_10_percent))
    
    # Estimate gradient
    if len(energies) > 2:
        analytics['final_gradient'] = float(energies[-1] - energies[-2])
    
    # Calculate energy improvement
    if len(energies) > 1:
        analytics['energy_improvement'] = float(energies[0] - energies[-1])
    
    return jsonify({
        'success': True,
        'analytics': analytics,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/compare-molecules', methods=['POST'])
@log_request
@handle_errors
def compare_molecules():
    """Compare properties of multiple molecules"""
    data = request.get_json() or {}
    molecules = data.get('molecules', SUPPORTED_MOLECULES)
    
    # Validate molecules
    for mol in molecules:
        if mol not in SUPPORTED_MOLECULES:
            raise ValueError(f'Unsupported molecule: {mol}')
    
    comparison = {}
    for mol in molecules:
        engine = QuantumMoleculeEngine(mol)
        ham_result = engine.build_hamiltonian()
        if ham_result['success']:
            comparison[mol] = {
                'num_qubits': ham_result['num_qubits'],
                'num_terms': ham_result['num_terms'],
                'classical_energy': ham_result['classical_energy'],
                'info': engine.get_molecule_info()
            }
    
    return jsonify({
        'success': True,
        'comparison': comparison,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/export-results', methods=['POST'])
@log_request
@handle_errors
def export_results():
    """Export VQE results in various formats"""
    data = request.get_json() or {}
    format_type = data.get('format', 'json')  # json, csv, or txt
    results = data.get('results', {})
    
    if not results:
        raise ValueError('No results data provided')
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"vqe_results_{timestamp}"
    
    if format_type == 'json':
        filepath = os.path.join(CACHE_DIR, f'{filename}.json')
        with open(filepath, 'w') as f:
            json.dump(results, f, indent=2)
    elif format_type == 'csv':
        filepath = os.path.join(CACHE_DIR, f'{filename}.csv')
        if 'iterations' in results:
            import csv
            with open(filepath, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Iteration', 'Energy'])
                for item in results['iterations']:
                    writer.writerow([item['iteration'], item['energy']])
    else:
        raise ValueError(f'Unsupported format: {format_type}')
    
    return jsonify({
        'success': True,
        'filename': filename,
        'path': filepath,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/health', methods=['GET'])
@log_request
def health_check():
    """Health check endpoint with system status"""
    import sys
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'Quantum Molecule Energy Estimator API',
        'version': '2.0.0',
        'python_version': sys.version,
        'supported_molecules': SUPPORTED_MOLECULES,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/run-vqe-stream/<molecule_name>', methods=['GET'])
@log_request
@validate_molecule
def run_vqe_stream(molecule_name):
    """Stream VQE simulation progress in real-time using Server-Sent Events"""
    
    def generate():
        try:
            # Get parameters from URL query string (SSE only supports GET)
            max_iter = request.args.get('max_iter', 100, type=int)
            
            # Validate max_iter
            if not isinstance(max_iter, int) or max_iter < MIN_ITERATIONS or max_iter > MAX_ITERATIONS_LIMIT:
                yield f"data: {json.dumps({'error': f'max_iter must be between {MIN_ITERATIONS} and {MAX_ITERATIONS_LIMIT}'})}\n\n"
                return
            
            logger.info(f"Starting real-time VQE stream for {molecule_name}")
            
            # STEP 1: Initialize
            yield f"data: {json.dumps({'step': 'initialize', 'status': 'running', 'message': f'Initializing quantum engine for {molecule_name}...', 'progress': 0})}\n\n"
            time.sleep(0.5)
            
            engine = QuantumMoleculeEngine(molecule_name)
            molecule_data = engine.molecule_data
            
            yield f"data: {json.dumps({'step': 'initialize', 'status': 'complete', 'data': {'molecule': molecule_name, 'electrons': molecule_data['electrons'], 'atoms': molecule_data['atoms'], 'bond_length': molecule_data['bond_length']}, 'progress': 10})}\n\n"
            time.sleep(0.3)
            
            # STEP 2: Build Hamiltonian
            yield f"data: {json.dumps({'step': 'hamiltonian', 'status': 'running', 'message': 'Running PySCF Hartree-Fock calculation...', 'progress': 15})}\n\n"
            time.sleep(0.5)
            
            ham_result = engine.build_hamiltonian()
            if not ham_result['success']:
                yield f"data: {json.dumps({'error': ham_result['error']})}\n\n"
                return
            
            yield f"data: {json.dumps({'step': 'hamiltonian', 'status': 'complete', 'data': {'num_qubits': ham_result['num_qubits'], 'num_terms': ham_result['num_terms'], 'classical_energy': ham_result['classical_energy'], 'pauli_terms': ham_result['pauli_terms'][:5]}, 'progress': 30})}\n\n"
            time.sleep(0.5)
            
            # STEP 3: Build Circuit
            yield f"data: {json.dumps({'step': 'circuit', 'status': 'running', 'message': 'Constructing Hartree-Fock initial state + variational ansatz...', 'progress': 35})}\n\n"
            time.sleep(0.5)
            
            # Generate circuit image
            circuit_path = os.path.join(STATIC_DIR, f'{molecule_name}_circuit.png')
            engine.generate_circuit_image(circuit_path)
            
            # Determine optimizer based on molecule electrons
            optimizer_name = 'COBYLA' if molecule_data['electrons'] > 2 else 'SLSQP'
            
            circuit_info = {
                'num_qubits': engine.hamiltonian.num_qubits,
                'num_parameters': engine.create_ansatz().num_parameters if hasattr(engine.create_ansatz(), 'num_parameters') else 'N/A',
                'circuit_url': f'/static/plots/{molecule_name}_circuit.png',
                'ansatz_type': 'HartreeFock + TwoLocal (RY, RZ, CX)',
                'entanglement': 'Linear',
                'optimizer': optimizer_name
            }
            
            yield f"data: {json.dumps({'step': 'circuit', 'status': 'complete', 'data': circuit_info, 'progress': 45})}\n\n"
            time.sleep(0.5)
            
            # STEP 4: VQE Optimization (with real-time iteration updates)
            yield f"data: {json.dumps({'step': 'vqe', 'status': 'running', 'message': f'Starting VQE optimization with {optimizer_name}...', 'progress': 50})}\n\n"
            time.sleep(0.5)
            
            # Create a custom callback to stream iterations
            iteration_count = [0]  # Use list to allow modification in callback
            last_energy = [0.0]
            
            def streaming_callback(eval_count, params, value, metadata):
                iteration_count[0] = eval_count
                last_energy[0] = float(value)
                
                # Stream iteration data
                iteration_progress = 50 + int((eval_count / max_iter) * 40)
                # This won't work in SSE context, so we'll collect iterations and send periodically
            
            # Run VQE with callback
            vqe_result = engine.run_vqe_with_streaming_callback(max_iter=max_iter, callback=streaming_callback)
            
            if not vqe_result['success']:
                yield f"data: {json.dumps({'error': vqe_result['error']})}\n\n"
                return
            
            # Send all iteration data
            for i, iter_data in enumerate(vqe_result['iterations']):
                progress = 50 + int((i / len(vqe_result['iterations'])) * 40)
                yield f"data: {json.dumps({'step': 'vqe', 'status': 'iterating', 'data': {'iteration': iter_data['iteration'], 'energy': iter_data['energy'], 'optimizer': vqe_result.get('optimizer', optimizer_name)}, 'progress': progress})}\n\n"
                time.sleep(0.05)  # Small delay for smooth animation
            
            yield f"data: {json.dumps({'step': 'vqe', 'status': 'complete', 'data': {'num_iterations': vqe_result['num_iterations'], 'final_energy': vqe_result['vqe_energy'], 'optimizer': vqe_result.get('optimizer', optimizer_name)}, 'progress': 90})}\n\n"
            time.sleep(0.5)
            
            # STEP 5: Generate Final Results
            yield f"data: {json.dumps({'step': 'results', 'status': 'running', 'message': 'Generating plots and analysis...', 'progress': 92})}\n\n"
            
            # Generate energy plot
            energy_path = os.path.join(STATIC_DIR, f'{molecule_name}_energy.png')
            engine.generate_energy_plot(energy_path)
            
            # Calculate error
            error_percentage = abs((vqe_result['vqe_energy'] - ham_result['classical_energy']) / ham_result['classical_energy'] * 100)
            
            final_results = {
                'molecule': molecule_name,
                'vqe_energy': vqe_result['vqe_energy'],
                'classical_energy': ham_result['classical_energy'],
                'num_iterations': vqe_result['num_iterations'],
                'error_percentage': error_percentage,
                'iterations': vqe_result['iterations'],
                'circuit_image': f'/static/plots/{molecule_name}_circuit.png',
                'energy_plot': f'/static/plots/{molecule_name}_energy.png'
            }
            
            yield f"data: {json.dumps({'step': 'results', 'status': 'complete', 'data': final_results, 'progress': 100})}\n\n"
            
            logger.info(f"VQE stream completed for {molecule_name}")
            
        except Exception as e:
            logger.error(f"Error in VQE stream: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream')


if __name__ == '__main__':
    print("🚀 Starting Quantum Molecule Energy Estimator API...")
    print("📡 Backend running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
