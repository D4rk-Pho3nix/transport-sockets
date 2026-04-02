import React, { useRef, useState } from 'react';
import { Download, Search, Filter, Calendar, MapPin, Navigation, FileText } from 'lucide-react';
import { useFleetStore } from '../stores/useFleetStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const trucks = useFleetStore((s) => s.trucks);
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(22);
      doc.setTextColor(10, 10, 10);
      doc.text('FleetTrack Distance Report', 14, 22);
      
      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
      doc.text(`Period: ${dateRange}`, 14, 35);
      doc.text(`Total Trucks: ${trucks.length}`, 14, 40);
      const totalDistance = trucks.reduce((s,t) => s + t.daily_distance, 0).toFixed(0);
      doc.text(`Total Fleet Distance: ${totalDistance} km`, 14, 45);

      // Data formatting
      const tableColumn = ["Truck #", "Plate Number", "Driver", "Cargo", "Distance (KM)", "Status"];
      const tableRows = trucks.map(truck => [
        truck.truck_number,
        truck.plate_number,
        truck.driver?.full_name || 'Unassigned',
        truck.cargo_type,
        `${truck.daily_distance.toFixed(1)} km`,
        truck.status.toUpperCase()
      ]);

      // AutoTable Generation
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3, textColor: [30, 30, 30] },
        headStyles: { fillColor: [240, 240, 240], textColor: [80, 80, 80], fontStyle: 'bold' },
        didParseCell: function(data) {
          // Colorizing status column
          if (data.section === 'body' && data.column.index === 5) {
             const status = data.cell.text[0];
             if (status === 'MOVING') data.cell.styles.textColor = [34, 197, 94]; // Text-green-500
             if (status === 'IDLE') data.cell.styles.textColor = [234, 179, 8]; // Text-yellow-500
          }
        }
      });
      
      const finalY = (doc as any).lastAutoTable?.finalY || 200;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Confidential — FleetTrack Industrial Prototype v1.0', 14, finalY + 10);

      // Save directly to Downloads folder forcefully bypassing any UUID renaming
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `fleettrack-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err) {
      console.error('PDF Export failed:', err);
      alert('An error occurred while generating the PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#111111] transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0]">Reports</h1>
          <p className="text-[#6B6B6B] dark:text-[#888888]">Daily distance metrics and historical route analysis</p>
        </div>
        <button 
          onClick={exportPDF} 
          disabled={isExporting}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isExporting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-2">Period</p>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-black dark:text-white" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-bold text-[#0A0A0A] dark:text-[#F0F0F0] text-sm outline-none w-full"
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
            </select>
          </div>
        </div>
        
        <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-2">Total Trucks</p>
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-black dark:text-white" />
            <span className="font-bold text-[#0A0A0A] dark:text-[#F0F0F0] text-lg">{trucks.length}</span>
          </div>
        </div>
        
        <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-2">Total Distance</p>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-black dark:text-white" />
            <span className="font-bold text-[#0A0A0A] dark:text-[#F0F0F0] text-lg">{trucks.reduce((s,t) => s + t.daily_distance, 0).toFixed(0)} km</span>
          </div>
        </div>
        
        <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-2">Status</p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Healthy</span>
          </div>
        </div>
      </div>

      <div ref={reportRef} className="bg-white dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-3xl overflow-hidden mb-12 transition-colors">
        <div className="p-8 border-b border-[#E0E0E0] dark:border-[#2E2E2E] flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white dark:border-black rounded-sm" />
              </div>
              <span className="text-xl font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0]">FleetTrack Reports</span>
            </div>
            <p className="text-[#6B6B6B] dark:text-[#888888] text-sm">Industrial Fleet Management Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Generation Date</p>
            <p className="text-xs text-[#6B6B6B] dark:text-[#888888]">{new Date().toLocaleDateString('en-IN')}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#AAAAAA] dark:text-[#555555] mt-1">{dateRange}</p>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-[#F5F5F5] dark:bg-[#1A1A1A] border-b border-[#E0E0E0] dark:border-[#2E2E2E]">
            <tr>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Truck #</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Plate Number</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Driver</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Cargo</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Distance (KM)</th>
              <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#2E2E2E]">
            {trucks.map((truck) => (
              <tr key={truck.id} className="hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors">
                <td className="p-6 font-display font-bold text-sm text-[#0A0A0A] dark:text-[#F0F0F0]">{truck.truck_number}</td>
                <td className="p-6 text-sm text-[#6B6B6B] dark:text-[#888888] font-mono">{truck.plate_number}</td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#EBEBEB] dark:bg-[#222222] flex items-center justify-center text-[10px] font-bold">
                      {truck.driver?.full_name.charAt(0)}
                    </div>
                    <span className="text-sm text-[#0A0A0A] dark:text-[#F0F0F0]">{truck.driver?.full_name}</span>
                  </div>
                </td>
                <td className="p-6 text-sm text-[#6B6B6B] dark:text-[#888888]">{truck.cargo_type}</td>
                <td className="p-6 font-display font-bold text-sm text-[#0A0A0A] dark:text-[#F0F0F0]">{truck.daily_distance.toFixed(1)} km</td>
                <td className="p-6">
                   <div className={`status-badge ${
                    truck.status === 'moving' ? 'text-green-500' :
                    truck.status === 'idle' ? 'text-yellow-500' :
                    truck.status === 'stopped' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {truck.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-8 border-t border-[#E0E0E0] dark:border-[#2E2E2E] bg-[#F5F5F5] dark:bg-[#1A1A1A] flex justify-between items-center">
           <div className="flex items-center gap-2 text-xs font-medium text-[#6B6B6B] dark:text-[#888888]">
              <FileText className="w-4 h-4" />
              Confidential — FleetTrack Industrial Prototype v1.0
           </div>
           <div className="text-[10px] uppercase tracking-widest font-black text-black dark:text-white">
              End of Report
           </div>
        </div>
      </div>
    </div>
  );
}
