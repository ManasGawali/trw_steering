import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import MachineCard from './components/MachineCard.jsx';
import ProductionChart from './components/ProductionChart.jsx';
import LogsPanel from './components/LogsPanel.jsx';
import ReportGenerator from './components/ReportGenerator.jsx';
import { machines, generateProductionData, generateLogs } from './data/mockData.js';

function App() {
  const [machineData, setMachineData] = useState(machines);
  const [productionData, setProductionData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');

  useEffect(() => {
    // Initialize data
    setProductionData(generateProductionData());
    setLogs(generateLogs());
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMachineData(prevData => 
        prevData.map(machine => ({
          ...machine,
          efficiency: Math.max(0, Math.min(100, machine.efficiency + (Math.random() - 0.5) * 10)),
          production: Math.max(0, machine.production + (Math.random() - 0.5) * 20),
          lastUpdate: new Date(),
        }))
      );
      setProductionData(generateProductionData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalMachines = machineData.length;
  const runningMachines = machineData.filter(m => m.status === 'running').length;
  const totalProduction = Math.round(machineData.reduce((sum, m) => sum + m.production, 0));
  const averageEfficiency = Math.round(
    machineData.reduce((sum, m) => sum + m.efficiency, 0) / machineData.length
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          totalMachines={totalMachines}
          runningMachines={runningMachines}
          totalProduction={totalProduction}
          averageEfficiency={averageEfficiency}
        />
        
        {/* Report Generation */}
        <div className="mb-8 flex justify-end">
          <ReportGenerator 
            machineData={machineData}
            productionData={productionData}
            logs={logs}
            totalProduction={totalProduction}
            averageEfficiency={averageEfficiency}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <ProductionChart data={productionData} selectedMachine={selectedMachine} />
          </div>
          <div>
            <LogsPanel logs={logs} />
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Machine Status</h2>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Machines</option>
              {machineData.map(machine => (
                <option key={machine.id} value={machine.id}>
                  {machine.name} ({machine.id})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {machineData.map(machine => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;