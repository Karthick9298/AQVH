import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTarget, FiGrid, FiZap, FiBarChart2, FiTrendingUp, FiActivity, FiPieChart, FiMenu, FiX } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { path: '/', label: 'Overview', icon: FiHome, description: 'Dashboard overview' },
    { path: '/molecules', label: 'Molecule Explorer', icon: FiTarget, description: 'Explore molecules' },
    { path: '/hamiltonian', label: 'Hamiltonian Viewer', icon: FiGrid, description: 'View Hamiltonians' },
    { path: '/simulation', label: 'VQE Simulation', icon: FiZap, description: 'Run simulations' },
    { path: '/results', label: 'Results & Analysis', icon: FiBarChart2, description: 'View results' },
    { path: '/analytics', label: 'Advanced Analytics', icon: FiPieChart, description: 'Deep insights' },
    { path: '/optimizer', label: 'Optimizer Comparison', icon: FiTrendingUp, description: 'Compare optimizers' },
    { path: '/bond-scan', label: 'Bond Length Scan', icon: FiActivity, description: 'PES analysis' }
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 min-h-screen border-r border-gray-800 flex flex-col transition-all duration-300 relative`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold gradient-text">AQVH2</h1>
            <p className="text-xs text-gray-400 mt-1">Quantum Chemistry Simulator</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        >
          {collapsed ? <FiMenu className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <div key={item.path} className="relative group">
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 animate-pulse-glow'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white hover-lift'
                }`}
              >
                <Icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{item.label}</span>
                    {!isActive && (
                      <span className="text-xs text-gray-500 block truncate">{item.description}</span>
                    )}
                  </div>
                )}
              </Link>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                    {item.label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Status</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <div className="text-xs text-gray-500 text-center pt-2">
              <p className="font-semibold text-gray-400">Powered by Qiskit VQE</p>
              <p className="text-gray-600 mt-1">v2.0.0</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
