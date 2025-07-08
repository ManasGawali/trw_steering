import React, { useState } from 'react';
import { FileText, Download, Loader2, Calendar, Factory, TrendingUp, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportGenerator = ({ machineData, productionData, logs, totalProduction, averageEfficiency }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Create a temporary div for the report content
      const reportElement = document.createElement('div');
      reportElement.style.position = 'absolute';
      reportElement.style.left = '-9999px';
      reportElement.style.width = '800px';
      reportElement.style.backgroundColor = 'white';
      reportElement.style.padding = '40px';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      
      // Generate report HTML
      reportElement.innerHTML = generateReportHTML();
      document.body.appendChild(reportElement);
      
      // Convert to canvas
      const canvas = await html2canvas(reportElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: reportElement.scrollHeight,
        windowWidth: 800,
        windowHeight: reportElement.scrollHeight
      });
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`production-report-${timestamp}.pdf`);
      
      // Clean up
      document.body.removeChild(reportElement);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportHTML = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    // Calculate additional metrics
    const runningMachines = machineData.filter(m => m.status === 'running').length;
    const maintenanceMachines = machineData.filter(m => m.status === 'maintenance').length;
    const idleMachines = machineData.filter(m => m.status === 'idle').length;
    const errorMachines = machineData.filter(m => m.status === 'error').length;
    
    const recentLogs = logs.slice(0, 10);
    const errorLogs = logs.filter(log => log.type === 'error').length;
    const warningLogs = logs.filter(log => log.type === 'warning').length;
    
    // Calculate production trends
    const last6Hours = productionData.slice(-6);
    const previous6Hours = productionData.slice(-12, -6);
    const currentAvg = last6Hours.reduce((sum, d) => sum + d.production, 0) / last6Hours.length;
    const previousAvg = previous6Hours.reduce((sum, d) => sum + d.production, 0) / previous6Hours.length;
    const trend = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    return `
      <div style="max-width: 800px; margin: 0 auto; color: #333;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3B82F6; padding-bottom: 20px;">
          <h1 style="color: #1F2937; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">
            Production Dashboard Report
          </h1>
          <p style="color: #6B7280; font-size: 16px; margin: 0;">
            Generated on ${currentDate} at ${currentTime}
          </p>
        </div>

        <!-- Executive Summary -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #3B82F6; padding-left: 15px;">
            Executive Summary
          </h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; font-size: 14px; margin: 0 0 5px 0;">Total Machines</h3>
              <p style="color: #1F2937; font-size: 24px; font-weight: bold; margin: 0;">${machineData.length}</p>
            </div>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; font-size: 14px; margin: 0 0 5px 0;">Running Machines</h3>
              <p style="color: #10B981; font-size: 24px; font-weight: bold; margin: 0;">${runningMachines}</p>
            </div>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; font-size: 14px; margin: 0 0 5px 0;">Total Production</h3>
              <p style="color: #3B82F6; font-size: 24px; font-weight: bold; margin: 0;">${totalProduction} units/h</p>
            </div>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
              <h3 style="color: #374151; font-size: 14px; margin: 0 0 5px 0;">Average Efficiency</h3>
              <p style="color: #F59E0B; font-size: 24px; font-weight: bold; margin: 0;">${averageEfficiency}%</p>
            </div>
          </div>
        </div>

        <!-- Machine Status Overview -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #10B981; padding-left: 15px;">
            Machine Status Overview
          </h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 20px; background: #ECFDF5; border-radius: 12px; border: 2px solid #10B981; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #10B981; font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">${runningMachines}</p>
              <p style="color: #065F46; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Running</p>
            </div>
            <div style="text-align: center; padding: 20px; background: #FFFBEB; border-radius: 12px; border: 2px solid #F59E0B; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #F59E0B; font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">${idleMachines}</p>
              <p style="color: #92400E; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Idle</p>
            </div>
            <div style="text-align: center; padding: 20px; background: #EFF6FF; border-radius: 12px; border: 2px solid #3B82F6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #3B82F6; font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">${maintenanceMachines}</p>
              <p style="color: #1E40AF; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Maintenance</p>
            </div>
            <div style="text-align: center; padding: 20px; background: #FEF2F2; border-radius: 12px; border: 2px solid #EF4444; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="color: #EF4444; font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">${errorMachines}</p>
              <p style="color: #991B1B; font-size: 12px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Error</p>
            </div>
          </div>
        </div>

        <!-- Individual Machine Details -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #F59E0B; padding-left: 15px;">
            Machine Performance Details
          </h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #F9FAFB; border-bottom: 2px solid #E5E7EB;">
                <th style="padding: 16px 12px; text-align: left; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Machine</th>
                <th style="padding: 16px 12px; text-align: center; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                <th style="padding: 16px 12px; text-align: right; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Efficiency</th>
                <th style="padding: 16px 12px; text-align: right; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Production</th>
              </tr>
            </thead>
            <tbody>
              ${machineData.map((machine, index) => `
                <tr style="border-bottom: 1px solid #F3F4F6; ${index % 2 === 0 ? 'background: #FAFAFA;' : 'background: white;'}">
                  <td style="padding: 16px 12px; font-size: 14px; color: #1F2937;">
                    <strong>${machine.name}</strong><br>
                    <span style="color: #6B7280; font-size: 12px;">${machine.id}</span>
                  </td>
                  <td style="padding: 16px 12px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; color: white; background: ${
                      machine.status === 'running' ? '#10B981' :
                      machine.status === 'idle' ? '#F59E0B' :
                      machine.status === 'maintenance' ? '#3B82F6' : '#EF4444'
                    };">
                      ${machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                    </span>
                  </td>
                  <td style="padding: 16px 12px; text-align: right; font-size: 14px; font-weight: 600; color: #1F2937;">
                    ${Math.round(machine.efficiency)}%
                  </td>
                  <td style="padding: 16px 12px; text-align: right; font-size: 14px; font-weight: 600; color: #1F2937;">
                    ${Math.round(machine.production)} units/h
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Production Trends -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #8B5CF6; padding-left: 15px;">
            Production Trends
          </h2>
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
              <div style="text-align: center;">
                <p style="color: #6B7280; font-size: 12px; margin: 0 0 5px 0;">6-Hour Trend</p>
                <p style="color: ${trend >= 0 ? '#10B981' : '#EF4444'}; font-size: 18px; font-weight: bold; margin: 0;">
                  ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%
                </p>
              </div>
              <div style="text-align: center;">
                <p style="color: #6B7280; font-size: 12px; margin: 0 0 5px 0;">Current Average</p>
                <p style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0;">
                  ${Math.round(currentAvg)} units/h
                </p>
              </div>
              <div style="text-align: center;">
                <p style="color: #6B7280; font-size: 12px; margin: 0 0 5px 0;">Previous Average</p>
                <p style="color: #1F2937; font-size: 18px; font-weight: bold; margin: 0;">
                  ${Math.round(previousAvg)} units/h
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- System Alerts & Logs -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #EF4444; padding-left: 15px;">
            System Alerts & Recent Activity
          </h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
            <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; border-left: 4px solid #EF4444;">
              <h3 style="color: #991B1B; font-size: 14px; margin: 0 0 5px 0;">Error Logs</h3>
              <p style="color: #EF4444; font-size: 20px; font-weight: bold; margin: 0;">${errorLogs}</p>
            </div>
            <div style="background: #FFFBEB; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
              <h3 style="color: #92400E; font-size: 14px; margin: 0 0 5px 0;">Warning Logs</h3>
              <p style="color: #F59E0B; font-size: 20px; font-weight: bold; margin: 0;">${warningLogs}</p>
            </div>
          </div>
          
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Recent System Events</h3>
          <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            ${recentLogs.map((log, index) => `
              <div style="padding: 12px; border-bottom: ${index < recentLogs.length - 1 ? '1px solid #F3F4F6' : 'none'}; border-left: 4px solid ${
                log.type === 'error' ? '#EF4444' :
                log.type === 'warning' ? '#F59E0B' :
                log.type === 'maintenance' ? '#3B82F6' :
                log.type === 'start' ? '#10B981' : '#6B7280'
              };">
                <div style="display: flex; justify-content: between; align-items: start;">
                  <div style="flex: 1;">
                    <p style="color: #1F2937; font-size: 14px; font-weight: 500; margin: 0 0 4px 0;">${log.message}</p>
                    <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px 0;">${log.details}</p>
                    <p style="color: #9CA3AF; font-size: 11px; margin: 0;">${log.timestamp.toLocaleString()}</p>
                  </div>
                  <span style="background: #F3F4F6; color: #6B7280; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 500;">
                    ${log.machineId}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            This report was automatically generated by the Production Dashboard System
          </p>
          <p style="color: #9CA3AF; font-size: 11px; margin: 5px 0 0 0;">
            Report ID: RPT-${Date.now()} | Generated: ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `;
  };

  return (
    <div className="relative">
      <button
        onClick={generateReport}
        disabled={isGenerating}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
            <Download className="w-4 h-4" />
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-64">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Creating comprehensive production report...</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;