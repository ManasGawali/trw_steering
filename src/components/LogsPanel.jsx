import React, { useState } from 'react';
import { AlertTriangle, Info, Settings, Play, Square, AlertCircle } from 'lucide-react';

const LogsPanel = ({ logs }) => {
  const [filter, setFilter] = useState('all');
  
  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'maintenance': return <Settings className="w-4 h-4 text-blue-500" />;
      case 'start': return <Play className="w-4 h-4 text-green-500" />;
      case 'stop': return <Square className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };
  
  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'maintenance': return 'border-l-blue-500 bg-blue-50';
      case 'start': return 'border-l-green-500 bg-green-50';
      case 'stop': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };
  
  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">System Logs</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Logs</option>
          <option value="error">Errors</option>
          <option value="warning">Warnings</option>
          <option value="maintenance">Maintenance</option>
          <option value="start">Start Events</option>
          <option value="stop">Stop Events</option>
          <option value="info">Info</option>
        </select>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`border-l-4 p-4 rounded-r-lg ${getLogColor(log.type)} hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start space-x-3">
              {getLogIcon(log.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{log.message}</p>
                  <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded-full">
                    {log.machineId}
                  </span>
                </div>
                {log.details && (
                  <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {log.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsPanel;