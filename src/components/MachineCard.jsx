import React from 'react';
import { Activity, AlertTriangle, Pause, Settings, CheckCircle } from 'lucide-react';

const MachineCard = ({ machine }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Activity className="w-5 h-5 text-green-500" />;
      case 'idle': return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'maintenance': return <Settings className="w-5 h-5 text-blue-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(machine.status)}
          <div>
            <h3 className="font-semibold text-gray-900">{machine.name}</h3>
            <p className="text-sm text-gray-500">{machine.id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(machine.status)}`}>
          {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Efficiency</p>
          <p className="text-xl font-bold text-gray-900">{machine.efficiency}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${machine.efficiency}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Production</p>
          <p className="text-xl font-bold text-gray-900">{machine.production}</p>
          <p className="text-xs text-gray-500 mt-1">units/hour</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {machine.lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default MachineCard;