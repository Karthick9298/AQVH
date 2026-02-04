import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { FiInfo } from 'react-icons/fi';

const MoleculeExplorer = ({ onMoleculeSelect }) => {
  const [molecules, setMolecules] = useState([]);
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMolecules();
  }, []);

  const fetchMolecules = async () => {
    try {
      const response = await api.getMolecules();
      setMolecules(response.data.molecules);
    } catch (error) {
      console.error('Error fetching molecules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMolecule = async (moleculeName) => {
    try {
      const response = await api.getMoleculeInfo(moleculeName);
      setSelectedMolecule(response.data.molecule);
      if (onMoleculeSelect) {
        onMoleculeSelect(moleculeName);
      }
    } catch (error) {
      console.error('Error fetching molecule info:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading molecules..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Molecule Explorer</h1>
        <p className="text-gray-400 text-lg">Select a molecule to analyze</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {molecules.map((molecule) => (
          <Card 
            key={molecule.name} 
            className="cursor-pointer hover:border-blue-500 transition-all duration-200 transform hover:scale-105"
            onClick={() => handleSelectMolecule(molecule.name)}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{molecule.name === 'H2' ? '🔬' : '⚗️'}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{molecule.formula}</h3>
              <p className="text-gray-400 mb-4">{molecule.full_name}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400">Electrons</div>
                  <div className="text-xl font-bold text-blue-400">{molecule.electrons}</div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-gray-400">Atoms</div>
                  <div className="text-xl font-bold text-purple-400">{molecule.atoms}</div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg col-span-2">
                  <div className="text-gray-400">Bond Length</div>
                  <div className="text-xl font-bold text-green-400">{molecule.bond_length} Å</div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Basis Set: {molecule.basis.toUpperCase()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedMolecule && (
        <Card title="Molecule Details" icon={FiInfo}>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Molecular Geometry</h4>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400">
                {selectedMolecule.geometry}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Description</h4>
              <p className="text-gray-300">{selectedMolecule.theory}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Electrons</div>
                <div className="text-2xl font-bold text-blue-400">{selectedMolecule.electrons}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Atoms</div>
                <div className="text-2xl font-bold text-purple-400">{selectedMolecule.atoms}</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Basis</div>
                <div className="text-2xl font-bold text-green-400">{selectedMolecule.basis.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MoleculeExplorer;
