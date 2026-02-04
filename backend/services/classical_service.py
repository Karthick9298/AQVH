"""
Classical Service - Handles classical energy computations
"""

from pyscf import gto, scf


class ClassicalService:
    """Service for classical quantum chemistry calculations"""
    
    @staticmethod
    def compute_hartree_fock(molecule_config):
        """Compute Hartree-Fock energy"""
        try:
            mol = gto.M(
                atom=molecule_config['geometry'],
                basis=molecule_config['basis'],
                charge=molecule_config['charge'],
                spin=molecule_config['spin']
            )
            
            mf = scf.RHF(mol)
            energy = mf.kernel()
            
            return {
                'success': True,
                'energy': float(energy),
                'method': 'Hartree-Fock',
                'basis': molecule_config['basis']
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
