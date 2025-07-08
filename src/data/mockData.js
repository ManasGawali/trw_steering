export const machines = [
  {
    id: 'M001',
    name: 'CNC Mill #1',
    status: 'running',
    efficiency: 87,
    production: 145,
    lastUpdate: new Date(),
  },
  {
    id: 'M002',
    name: 'Lathe #2',
    status: 'running',
    efficiency: 92,
    production: 120,
    lastUpdate: new Date(),
  },
  {
    id: 'M003',
    name: 'Press #1',
    status: 'maintenance',
    efficiency: 0,
    production: 0,
    lastUpdate: new Date(),
  },
  {
    id: 'M004',
    name: 'Grinder #3',
    status: 'idle',
    efficiency: 45,
    production: 80,
    lastUpdate: new Date(),
  },
  {
    id: 'M005',
    name: 'Welder #2',
    status: 'running',
    efficiency: 95,
    production: 200,
    lastUpdate: new Date(),
  },
];

export const generateProductionData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    machines.forEach(machine => {
      const baseProduction = machine.production;
      const expectedProduction = baseProduction * 0.95; // Expected is 95% of max capacity
      const variance = Math.random() * 40 - 20;
      const production = Math.max(0, baseProduction + variance);
      const efficiency = machine.status === 'running' ? 
        Math.min(100, Math.max(0, machine.efficiency + Math.random() * 20 - 10)) : 
        machine.status === 'maintenance' ? 0 : Math.random() * 30;
      
      data.push({
        time: timeString,
        machineId: machine.id,
        production: Math.round(production),
        expectedProduction: Math.round(expectedProduction),
        efficiency: Math.round(efficiency),
      });
    });
  }
  
  return data;
};

export const generateLogs = () => {
  const logs = [];
  const now = new Date();
  
  const logMessages = [
    { type: 'start', message: 'Production cycle started', details: 'Automatic startup sequence completed' },
    { type: 'stop', message: 'Production cycle stopped', details: 'Planned maintenance window' },
    { type: 'maintenance', message: 'Scheduled maintenance', details: 'Oil change and calibration check' },
    { type: 'error', message: 'Temperature threshold exceeded', details: 'Cooling system malfunction detected' },
    { type: 'warning', message: 'Efficiency below target', details: 'Current efficiency: 72%, Target: 85%' },
    { type: 'info', message: 'Production target achieved', details: 'Daily quota reached ahead of schedule' },
  ];
  
  for (let i = 0; i < 25; i++) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
    const machine = machines[Math.floor(Math.random() * machines.length)];
    const logType = logMessages[Math.floor(Math.random() * logMessages.length)];
    
    logs.push({
      id: `log-${i}`,
      timestamp,
      machineId: machine.id,
      type: logType.type,
      message: `${machine.name}: ${logType.message}`,
      details: logType.details,
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};