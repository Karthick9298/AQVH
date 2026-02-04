import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '../components/Tooltip';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import api from '../services/api';
import { FiDatabase, FiDownload, FiTrendingUp, FiPieChart, FiBarChart2, FiActivity } from 'react-icons/fi';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const AdvancedAnalytics = () => {
  const [results, setResults] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    const savedResults = sessionStorage.getItem('vqe_results');
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      fetchAnalytics(parsedResults);
    }
  };

  const fetchAnalytics = async (resultsData) => {
    if (!resultsData || !resultsData.iterations) return;
    
    setLoading(true);
    try {
      const response = await api.getAnalytics(resultsData.molecule, resultsData.iterations);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!results) return;
    
    try {
      const response = await api.exportResults({ format: exportFormat, results });
      showToast(`Results exported as ${exportFormat.toUpperCase()}`, 'success');
      setShowModal(false);
    } catch (error) {
      console.error('Error exporting results:', error);
      showToast('Failed to export results', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  if (!results) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold gradient-text">Advanced Analytics</h1>
        <Card>
          <div className="text-center py-12">
            <FiPieChart className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">No simulation results available</p>
            <p className="text-gray-500 text-sm mt-2">Run a VQE simulation first to see advanced analytics</p>
          </div>
        </Card>
      </div>
    );
  }

  // Convergence analysis chart
  const convergenceData = {
    labels: results.iterations.map(item => item.iteration),
    datasets: [{
      label: 'Energy Convergence',
      data: results.iterations.map(item => item.energy),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Energy distribution
  const energyDistribution = {
    labels: ['Min', 'Mean', 'Median', 'Max'],
    datasets: [{
      label: 'Energy Statistics (Ha)',
      data: analytics ? [
        analytics.min_energy,
        analytics.mean_energy,
        analytics.median_energy,
        analytics.max_energy
      ] : [0, 0, 0, 0],
      backgroundColor: [
        'rgba(16, 185, 129, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(168, 85, 247, 0.6)',
        'rgba(239, 68, 68, 0.6)'
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2
    }]
  };

  // Performance radar
  const performanceMetrics = {
    labels: ['Convergence', 'Accuracy', 'Stability', 'Efficiency'],
    datasets: [{
      label: 'VQE Performance',
      data: analytics ? [
        Math.max(0, 100 - (analytics.convergence_rate || 0) * 1000),
        Math.max(0, 100 - Math.abs(analytics.final_gradient || 0) * 100),
        Math.max(0, 100 - (analytics.std_deviation || 0) * 10),
        Math.min(100, (analytics.energy_improvement || 0) * 100)
      ] : [0, 0, 0, 0],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(59, 130, 246)'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#fff', font: { size: 12 } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Advanced Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive analysis of VQE simulation results</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all hover-lift"
        >
          <FiDownload /> Export Results
        </button>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-effect">
            <div className="text-center">
              <FiActivity className="w-8 h-8 mx-auto text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">Final Energy</p>
              <p className="text-2xl font-bold text-blue-400">{results.vqe_energy.toFixed(6)} Ha</p>
            </div>
          </Card>
          
          <Card className="glass-effect">
            <div className="text-center">
              <FiTrendingUp className="w-8 h-8 mx-auto text-green-400 mb-2" />
              <p className="text-sm text-gray-400">Energy Improvement</p>
              <p className="text-2xl font-bold text-green-400">
                {(analytics.energy_improvement * 1000).toFixed(3)} mHa
              </p>
            </div>
          </Card>
          
          <Card className="glass-effect">
            <div className="text-center">
              <FiBarChart2 className="w-8 h-8 mx-auto text-purple-400 mb-2" />
              <p className="text-sm text-gray-400">Std Deviation</p>
              <p className="text-2xl font-bold text-purple-400">
                {(analytics.std_deviation * 1000).toFixed(3)} mHa
              </p>
            </div>
          </Card>
          
          <Card className="glass-effect">
            <div className="text-center">
              <FiDatabase className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
              <p className="text-sm text-gray-400">Iterations</p>
              <p className="text-2xl font-bold text-yellow-400">{results.num_iterations}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Detailed Statistics */}
      {analytics && (
        <Card title="Statistical Analysis" icon={FiBarChart2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Energy Statistics</h3>
              {[
                { label: 'Mean Energy', value: analytics.mean_energy, unit: 'Ha', color: 'blue' },
                { label: 'Median Energy', value: analytics.median_energy, unit: 'Ha', color: 'purple' },
                { label: 'Min Energy', value: analytics.min_energy, unit: 'Ha', color: 'green' },
                { label: 'Max Energy', value: analytics.max_energy, unit: 'Ha', color: 'red' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">{stat.label}</span>
                    <Tooltip text={`${stat.value} ${stat.unit}`}>
                      <span className={`text-${stat.color}-400 font-mono font-bold`}>
                        {stat.value.toFixed(6)} {stat.unit}
                      </span>
                    </Tooltip>
                  </div>
                  <ProgressBar 
                    progress={((stat.value - analytics.min_energy) / (analytics.max_energy - analytics.min_energy)) * 100} 
                    color={stat.color}
                    showPercentage={false}
                  />
                </div>
              ))}
            </div>
            
            <div className="h-80">
              <Bar data={energyDistribution} options={chartOptions} />
            </div>
          </div>
        </Card>
      )}

      {/* Convergence Analysis */}
      <Card title="Convergence Analysis" icon={FiTrendingUp}>
        <div className="h-96">
          <Line data={convergenceData} options={chartOptions} />
        </div>
      </Card>

      {/* Performance Radar */}
      {analytics && (
        <Card title="Performance Profile" icon={FiPieChart}>
          <div className="h-96">
            <Radar 
              data={performanceMetrics}
              options={{
                ...chartOptions,
                scales: {
                  r: {
                    angleLines: { color: 'rgba(156, 163, 175, 0.2)' },
                    grid: { color: 'rgba(156, 163, 175, 0.2)' },
                    pointLabels: { color: '#9ca3af', font: { size: 12 } },
                    ticks: { color: '#9ca3af', backdropColor: 'transparent' }
                  }
                }
              }}
            />
          </div>
        </Card>
      )}

      {/* Export Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Export Results">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <button
            onClick={handleExport}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Export
          </button>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {loading && <LoadingSpinner message="Loading analytics..." />}
    </div>
  );
};

export default AdvancedAnalytics;
