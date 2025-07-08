import React from 'react';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';

const ProductionChart = ({ data, selectedMachine }) => {
  const chartWidth = 800;
  const chartHeight = 350;
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  
  const filteredData = selectedMachine 
    ? data.filter(d => d.machineId === selectedMachine)
    : data;
  
  // Group data by time
  const timeGroups = filteredData.reduce((acc, point) => {
    if (!acc[point.time]) {
      acc[point.time] = [];
    }
    acc[point.time].push(point);
    return acc;
  }, {});
  
  const times = Object.keys(timeGroups).slice(-12); // Last 12 hours
  const maxProduction = Math.max(...filteredData.map(d => Math.max(d.production, d.expectedProduction)));
  
  // Calculate production summary
  const calculateSummary = () => {
    const totalActual = filteredData.reduce((sum, d) => sum + d.production, 0);
    const totalExpected = filteredData.reduce((sum, d) => sum + d.expectedProduction, 0);
    const variance = ((totalActual - totalExpected) / totalExpected) * 100;
    
    let status = 'on-track';
    let estimatedCompletion = 'On schedule';
    
    if (variance > 5) {
      status = 'ahead';
      const timeAhead = Math.abs(variance) * 0.1; // Rough calculation
      estimatedCompletion = `${timeAhead.toFixed(1)}h ahead`;
    } else if (variance < -5) {
      status = 'behind';
      const timeBehind = Math.abs(variance) * 0.1;
      estimatedCompletion = `${timeBehind.toFixed(1)}h behind`;
    }
    
    return {
      totalActual,
      totalExpected,
      variance,
      estimatedCompletion,
      status
    };
  };
  
  const summary = calculateSummary();
  
  const getColor = (machineId) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const index = machineId.charCodeAt(machineId.length - 1) % colors.length;
    return colors[index];
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'ahead': return 'text-green-600 bg-green-50 border-green-200';
      case 'behind': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ahead': return <TrendingUp className="w-4 h-4" />;
      case 'behind': return <TrendingDown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Production Timeline</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Actual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Expected</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>
      
      {/* Production Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Actual Production</p>
              <p className="text-2xl font-bold">{Math.round(summary.totalActual)}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Expected Production</p>
              <p className="text-2xl font-bold">{Math.round(summary.totalExpected)}</p>
            </div>
            <Target className="w-6 h-6 text-gray-200" />
          </div>
        </div>
        
        <div className={`rounded-lg p-4 border-2 ${getStatusColor(summary.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Variance</p>
              <p className="text-2xl font-bold">{summary.variance.toFixed(1)}%</p>
            </div>
            {getStatusIcon(summary.status)}
          </div>
        </div>
        
        <div className={`rounded-lg p-4 border-2 ${getStatusColor(summary.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Schedule</p>
              <p className="text-lg font-bold">{summary.estimatedCompletion}</p>
            </div>
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="w-full">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1={margin.left}
              y1={margin.top + (i * (chartHeight - margin.top - margin.bottom) / 4)}
              x2={chartWidth - margin.right}
              y2={margin.top + (i * (chartHeight - margin.top - margin.bottom) / 4)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => (
            <text
              key={i}
              x={margin.left - 10}
              y={margin.top + (i * (chartHeight - margin.top - margin.bottom) / 4) + 5}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {Math.round(maxProduction * (1 - i / 4))}
            </text>
          ))}
          
          {/* Expected production lines (dashed) */}
          {selectedMachine ? (
            <polyline
              points={times.map((time, index) => {
                const points = timeGroups[time] || [];
                const expectedProduction = points.find(p => p.machineId === selectedMachine)?.expectedProduction || 0;
                const x = margin.left + (index * (chartWidth - margin.left - margin.right) / (times.length - 1));
                const y = margin.top + (chartHeight - margin.top - margin.bottom) - (expectedProduction / maxProduction) * (chartHeight - margin.top - margin.bottom);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="opacity-70"
            />
          ) : (
            Array.from(new Set(filteredData.map(d => d.machineId))).map(machineId => (
              <polyline
                key={`expected-${machineId}`}
                points={times.map((time, index) => {
                  const points = timeGroups[time] || [];
                  const expectedProduction = points.find(p => p.machineId === machineId)?.expectedProduction || 0;
                  const x = margin.left + (index * (chartWidth - margin.left - margin.right) / (times.length - 1));
                  const y = margin.top + (chartHeight - margin.top - margin.bottom) - (expectedProduction / maxProduction) * (chartHeight - margin.top - margin.bottom);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                className="opacity-60"
              />
            ))
          )}
          
          {/* Actual production lines (solid) */}
          {selectedMachine ? (
            <polyline
              points={times.map((time, index) => {
                const points = timeGroups[time] || [];
                const production = points.find(p => p.machineId === selectedMachine)?.production || 0;
                const x = margin.left + (index * (chartWidth - margin.left - margin.right) / (times.length - 1));
                const y = margin.top + (chartHeight - margin.top - margin.bottom) - (production / maxProduction) * (chartHeight - margin.top - margin.bottom);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={getColor(selectedMachine)}
              strokeWidth="3"
              className="drop-shadow-sm"
            />
          ) : (
            Array.from(new Set(filteredData.map(d => d.machineId))).map(machineId => (
              <polyline
                key={`actual-${machineId}`}
                points={times.map((time, index) => {
                  const points = timeGroups[time] || [];
                  const production = points.find(p => p.machineId === machineId)?.production || 0;
                  const x = margin.left + (index * (chartWidth - margin.left - margin.right) / (times.length - 1));
                  const y = margin.top + (chartHeight - margin.top - margin.bottom) - (production / maxProduction) * (chartHeight - margin.top - margin.bottom);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={getColor(machineId)}
                strokeWidth="2.5"
                className="drop-shadow-sm"
              />
            ))
          )}
          
          {/* Data points for actual production */}
          {times.map((time, index) => {
            const points = timeGroups[time] || [];
            const relevantPoints = selectedMachine 
              ? points.filter(p => p.machineId === selectedMachine)
              : points;
            
            return relevantPoints.map(point => {
              const x = margin.left + (index * (chartWidth - margin.left - margin.right) / (times.length - 1));
              const y = margin.top + (chartHeight - margin.top - margin.bottom) - (point.production / maxProduction) * (chartHeight - margin.top - margin.bottom);
              const expectedY = margin.top + (chartHeight - margin.top - margin.bottom) - (point.expectedProduction / maxProduction) * (chartHeight - margin.top - margin.bottom);
              const variance = ((point.production - point.expectedProduction) / point.expectedProduction) * 100;
              
              return (
                <g key={`${point.machineId}-${time}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={getColor(point.machineId)}
                    className="hover:r-6 transition-all duration-200 cursor-pointer"
                  >
                    <title>
                      {`${point.machineId} at ${time}
Actual: ${point.production} units
Expected: ${point.expectedProduction} units
Variance: ${variance.toFixed(1)}%`}
                    </title>
                  </circle>
                  <circle
                    cx={x}
                    cy={expectedY}
                    r="3"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    className="opacity-70"
                  >
                    <title>{`Expected: ${point.expectedProduction} units`}</title>
                  </circle>
                </g>
              );
            });
          })}
          
          {/* X-axis labels */}
          {times.map((time, index) => (
            <text
              key={time}
              x={margin.left + (index * (chartWidth - margin.left - margin.right) / (times.length - 1))}
              y={chartHeight - margin.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {time}
            </text>
          ))}
          
          {/* Axis labels */}
          <text
            x={margin.left - 40}
            y={chartHeight / 2}
            textAnchor="middle"
            className="text-sm fill-gray-600"
            transform={`rotate(-90, ${margin.left - 40}, ${chartHeight / 2})`}
          >
            Production Units
          </text>
          
          <text
            x={chartWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-sm fill-gray-600"
          >
            Time (Hours)
          </text>
        </svg>
      </div>
    </div>
  );
};

export default ProductionChart;