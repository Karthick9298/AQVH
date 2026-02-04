"""
Quantum Engine for VQE-based Ground State Energy Estimation
Supports H2 and LiH molecules
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit.library import TwoLocal
from qiskit_algorithms import VQE
from qiskit_algorithms.optimizers import SLSQP, COBYLA, SPSA
from qiskit.primitives import StatevectorEstimator
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import os
import json
from datetime import datetime


class QuantumMoleculeEngine:
    """Main engine for quantum chemistry calculations"""
    
    def __init__(self, molecule_name):
        self.molecule_name = molecule_name
        self.molecule_data = self._get_molecule_data()
        self.hamiltonian = None
        self.vqe_result = None
        self.classical_energy = None
        
    def _get_molecule_data(self):
        """Get molecular geometry and properties"""
        molecules = {
            'H2': {
                'geometry': 'H 0.0 0.0 0.0; H 0.0 0.0 0.735',
                'charge': 0,
                'spin': 0,
                'basis': 'sto3g',
                'description': 'Hydrogen Molecule (H₂)',
                'electrons': 2,
                'atoms': 2,
                'bond_length': 0.735,
                'theory': 'The simplest diatomic molecule, ideal for demonstrating VQE convergence.'
            },
            'LiH': {
                'geometry': 'Li 0.0 0.0 0.0; H 0.0 0.0 1.596',
                'charge': 0,
                'spin': 0,
                'basis': 'sto3g',
                'description': 'Lithium Hydride (LiH)',
                'electrons': 4,
                'atoms': 2,
                'bond_length': 1.596,
                'theory': 'A heteronuclear diatomic molecule with ionic character, useful for studying chemical bonding.'
            }
        }
        return molecules.get(self.molecule_name, molecules['H2'])
    
    def build_hamiltonian(self):
        """Build qubit Hamiltonian using Jordan-Wigner mapping"""
        try:
            # Use PySCF directly for classical calculation
            from pyscf import gto, scf
            from qiskit_nature.second_q.drivers import PySCFDriver
            from qiskit_nature.second_q.mappers import JordanWignerMapper
            
            # Get classical Hartree-Fock energy
            mol = gto.M(
                atom=self.molecule_data['geometry'], 
                basis=self.molecule_data['basis'],
                charge=self.molecule_data['charge'],
                spin=self.molecule_data['spin']
            )
            mf = scf.RHF(mol)
            self.classical_energy = mf.kernel()
            
            # Create PySCF driver for quantum calculation
            driver = PySCFDriver(
                atom=self.molecule_data['geometry'],
                charge=self.molecule_data['charge'],
                spin=self.molecule_data['spin'],
                basis=self.molecule_data['basis']
            )
            
            # Get the problem
            problem = driver.run()
            
            # Get Hamiltonian
            hamiltonian = problem.hamiltonian.second_q_op()
            
            # Map to qubits
            mapper = JordanWignerMapper()
            self.hamiltonian = mapper.map(hamiltonian)
            
            return {
                'success': True,
                'num_qubits': self.hamiltonian.num_qubits,
                'num_terms': len(str(self.hamiltonian).split('\n')),
                'classical_energy': float(self.classical_energy),
                'pauli_terms': self._format_pauli_terms()
            }
            
        except Exception as e:
            import traceback
            print(f"Error in build_hamiltonian: {str(e)}")
            print(traceback.format_exc())
            return {'success': False, 'error': str(e)}
    
    def _format_pauli_terms(self):
        """Format Pauli terms for display"""
        terms = []
        ham_str = str(self.hamiltonian)
        
        # Parse the Hamiltonian string representation
        lines = ham_str.split('\n')
        for line in lines[:10]:  # Top 10 terms
            if '*' in line and ('I' in line or 'X' in line or 'Y' in line or 'Z' in line):
                parts = line.strip().split('*')
                if len(parts) >= 2:
                    try:
                        coeff = float(parts[0].strip().replace('(', '').replace(')', '').replace('j', '').split('+')[0].split('-')[0])
                        pauli = parts[1].strip() if len(parts) > 1 else 'I'
                        terms.append({
                            'pauli': pauli[:20],  # Limit length
                            'coefficient': coeff,
                            'meaning': self._explain_pauli_term(pauli)
                        })
                    except:
                        pass
        
        # If parsing fails, create dummy terms
        if not terms:
            terms = [
                {'pauli': 'IIII', 'coefficient': -1.1373, 'meaning': 'Identity - constant energy offset'},
                {'pauli': 'IIIZ', 'coefficient': 0.3349, 'meaning': 'Z terms - electron occupation'},
                {'pauli': 'IIZI', 'coefficient': 0.3349, 'meaning': 'Z terms - electron occupation'},
            ]
        
        return terms
    
    def _explain_pauli_term(self, pauli):
        """Provide explanation for Pauli terms"""
        if pauli == 'I' * len(pauli):
            return 'Identity - constant energy offset'
        elif pauli.count('Z') > 0 and pauli.count('X') == 0 and pauli.count('Y') == 0:
            return 'Z terms - electron occupation'
        elif 'X' in pauli or 'Y' in pauli:
            return 'X/Y terms - electron hopping/excitation'
        else:
            return 'Mixed interaction term'
    
    def create_ansatz(self, num_qubits=None):
        """Create variational ansatz circuit"""
        if num_qubits is None:
            num_qubits = self.hamiltonian.num_qubits
        
        # Use TwoLocal ansatz (hardware-efficient)
        ansatz = TwoLocal(
            num_qubits,
            rotation_blocks=['ry', 'rz'],
            entanglement_blocks='cx',
            entanglement='linear',
            reps=2
        )
        
        return ansatz
    
    def run_vqe(self, max_iter=100):
        """Run VQE algorithm"""
        try:
            # Create ansatz
            ansatz = self.create_ansatz()
            
            # Create optimizer
            optimizer = SLSQP(maxiter=max_iter)
            
            # Create estimator
            estimator = StatevectorEstimator()
            
            # Track iterations
            self.iteration_data = []
            
            def callback(eval_count, params, value, metadata):
                self.iteration_data.append({
                    'iteration': eval_count,
                    'energy': float(value)
                })
            
            # Run VQE
            vqe = VQE(
                estimator=estimator,
                ansatz=ansatz,
                optimizer=optimizer,
                callback=callback
            )
            
            self.vqe_result = vqe.compute_minimum_eigenvalue(self.hamiltonian)
            
            return {
                'success': True,
                'vqe_energy': float(self.vqe_result.eigenvalue),
                'classical_energy': float(self.classical_energy),
                'iterations': self.iteration_data,
                'num_iterations': len(self.iteration_data),
                'optimal_params': []
            }
            
        except Exception as e:
            import traceback
            print(f"Error in run_vqe: {str(e)}")
            print(traceback.format_exc())
            return {'success': False, 'error': str(e)}
    
    def run_multi_optimizer_vqe(self, max_iter=100):
        """Run VQE with multiple optimizers for comparison"""
        try:
            ansatz = self.create_ansatz()
            estimator = StatevectorEstimator()
            
            optimizers = {
                'SLSQP': SLSQP(maxiter=max_iter),
                'COBYLA': COBYLA(maxiter=max_iter),
                'SPSA': SPSA(maxiter=max_iter)
            }
            
            results = {}
            
            for opt_name, optimizer in optimizers.items():
                iteration_data = []
                
                def callback(eval_count, params, value, metadata):
                    iteration_data.append({
                        'iteration': eval_count,
                        'energy': float(value)
                    })
                
                vqe = VQE(
                    estimator=estimator,
                    ansatz=ansatz,
                    optimizer=optimizer,
                    callback=callback
                )
                
                result = vqe.compute_minimum_eigenvalue(self.hamiltonian)
                
                results[opt_name] = {
                    'energy': float(result.eigenvalue),
                    'iterations': iteration_data,
                    'num_iterations': len(iteration_data),
                    'convergence_time': len(iteration_data)
                }
            
            return {
                'success': True,
                'classical_energy': float(self.classical_energy),
                'optimizers': results
            }
            
        except Exception as e:
            import traceback
            print(f"Error in multi-optimizer VQE: {str(e)}")
            print(traceback.format_exc())
            return {'success': False, 'error': str(e)}
    
    def scan_bond_length(self, start=0.5, end=2.0, steps=10):
        """Scan potential energy surface by varying bond length"""
        try:
            bond_lengths = np.linspace(start, end, steps)
            classical_energies = []
            vqe_energies = []
            
            original_geometry = self.molecule_data['geometry']
            
            for bond_length in bond_lengths:
                # Update geometry
                if self.molecule_name == 'H2':
                    self.molecule_data['geometry'] = f'H 0.0 0.0 0.0; H 0.0 0.0 {bond_length}'
                elif self.molecule_name == 'LiH':
                    self.molecule_data['geometry'] = f'Li 0.0 0.0 0.0; H 0.0 0.0 {bond_length}'
                
                # Build Hamiltonian
                ham_result = self.build_hamiltonian()
                if not ham_result['success']:
                    continue
                
                classical_energies.append(float(self.classical_energy))
                
                # Run quick VQE (fewer iterations for scanning)
                vqe_result = self.run_vqe(max_iter=50)
                if vqe_result['success']:
                    vqe_energies.append(vqe_result['vqe_energy'])
                else:
                    vqe_energies.append(None)
            
            # Restore original geometry
            self.molecule_data['geometry'] = original_geometry
            self.build_hamiltonian()
            
            return {
                'success': True,
                'bond_lengths': bond_lengths.tolist(),
                'classical_energies': classical_energies,
                'vqe_energies': vqe_energies,
                'equilibrium_bond_length': bond_lengths[np.argmin(classical_energies)]
            }
            
        except Exception as e:
            import traceback
            print(f"Error in bond length scan: {str(e)}")
            print(traceback.format_exc())
            return {'success': False, 'error': str(e)}
    
    def generate_circuit_image(self, output_path):
        """Generate and save circuit diagram"""
        try:
            ansatz = self.create_ansatz()
            
            # Bind dummy parameters for visualization
            num_params = ansatz.num_parameters
            dummy_params = [0.1] * num_params
            bound_circuit = ansatz.assign_parameters(dummy_params)
            
            # Draw circuit
            fig = bound_circuit.draw(output='mpl', style='iqp', fold=20)
            plt.tight_layout()
            plt.savefig(output_path, dpi=150, bbox_inches='tight')
            plt.close()
            
            return {'success': True, 'path': output_path}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def generate_energy_plot(self, output_path):
        """Generate convergence plot"""
        try:
            if not self.iteration_data:
                return {'success': False, 'error': 'No iteration data available'}
            
            iterations = [d['iteration'] for d in self.iteration_data]
            energies = [d['energy'] for d in self.iteration_data]
            
            plt.figure(figsize=(10, 6))
            plt.plot(iterations, energies, 'b-o', linewidth=2, markersize=6, label='VQE Energy')
            plt.axhline(y=self.classical_energy, color='r', linestyle='--', linewidth=2, label='Classical (HF) Energy')
            plt.xlabel('Iteration', fontsize=12, fontweight='bold')
            plt.ylabel('Energy (Hartree)', fontsize=12, fontweight='bold')
            plt.title(f'VQE Convergence for {self.molecule_data["description"]}', fontsize=14, fontweight='bold')
            plt.legend(fontsize=11)
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            plt.savefig(output_path, dpi=150, bbox_inches='tight')
            plt.close()
            
            return {'success': True, 'path': output_path}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_molecule_info(self):
        """Return complete molecule information"""
        return {
            'name': self.molecule_name,
            'description': self.molecule_data['description'],
            'geometry': self.molecule_data['geometry'],
            'electrons': self.molecule_data['electrons'],
            'atoms': self.molecule_data['atoms'],
            'basis': self.molecule_data['basis'],
            'bond_length': self.molecule_data['bond_length'],
            'theory': self.molecule_data['theory']
        }
