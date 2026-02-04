import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTarget, FiGrid, FiZap, FiBarChart2, FiTrendingUp, FiActivity } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Overview', icon: FiHome },
    { path: '/molecules', label: 'Molecule Explorer', icon: FiTarget },
    { path: '/hamiltonian', label: 'Hamiltonian Viewer', icon: FiGrid },
    { path: '/simulation', label: 'VQE Simulation', icon: FiZap },
    { path: '/results', label: 'Results & Analysis', icon: FiBarChart2 },
    { path: '/optimizer', label: 'Optimizer Comparison', icon: FiTrendingUp },
    { path: '/bond-scan', label: 'Bond Length Scan', icon: FiActivity }
  ];

  return (
    <div className="w-64 bg-gray-900 min-h-screen border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">AQVH914</h1>
        <p className="text-xs text-gray-400 mt-1">Quantum Chemistry Simulator</p>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="text-xl" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Powered by Qiskit VQE
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
