import React, { useState } from 'react';
import { Download, Calendar, FileText, TrendingUp, Filter, BarChart3, AlertCircle } from 'lucide-react';
import { LocationBarChart, TrendChart } from '../components/Chart';

const chartData = [
  { month: 'May', incidents: 12 },
  { month: 'Jun', incidents: 19 },
  { month: 'Jul', incidents: 15 },
  { month: 'Aug', incidents: 22 },
  { month: 'Sep', incidents: 18 },
  { month: 'Oct', incidents: 25 },
];

const locationData = [
  { location: 'Cafeteria', count: 12 },
  { location: 'Parking Lot', count: 8 },
  { location: 'Main Gate', count: 6 },
  { location: 'Library', count: 5 },
  { location: 'Building A', count: 4 },
];

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate summary statistics
  const totalIncidents = chartData.reduce((sum, item) => sum + item.incidents, 0);
  const avgIncidents = Math.round(totalIncidents / chartData.length);
  const highestMonth = chartData.reduce((max, item) => 
    item.incidents > max.incidents ? item : max, chartData[0]
  );
  const trend = ((chartData[chartData.length - 1].incidents - chartData[0].incidents) / chartData[0].incidents * 100).toFixed(1);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated successfully! Download will start shortly.');
    }, 1500);
  };

  const handleExportPDF = () => {
    alert('Exporting report as PDF...');
  };

  const handleExportCSV = () => {
    // Generate CSV content
    const csvHeader = 'Month,Incidents\n';
    const csvData = chartData.map(row => `${row.month},${row.incidents}`).join('\n');
    const csv = csvHeader + csvData;

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive security reports and insights</p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Report Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Incidents</option>
              <option value="high">High Severity Only</option>
              <option value="medium">Medium Severity Only</option>
              <option value="low">Low Severity Only</option>
              <option value="location">By Location</option>
              <option value="trend">Trend Analysis</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Incidents</h3>
            <BarChart3 className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{totalIncidents}</p>
          <p className="text-sm opacity-80 mt-1">Last 6 months</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Avg per Month</h3>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{avgIncidents}</p>
          <p className="text-sm opacity-80 mt-1">incidents/month</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Peak Month</h3>
            <Calendar className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{highestMonth.incidents}</p>
          <p className="text-sm opacity-80 mt-1">{highestMonth.month}</p>
        </div>

        <div className={`bg-gradient-to-br ${parseFloat(trend) > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} rounded-lg shadow-md p-6 text-white`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Trend</h3>
            <AlertCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{trend > 0 ? '+' : ''}{trend}%</p>
          <p className="text-sm opacity-80 mt-1">vs first month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Incident Trends</h2>
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <TrendChart data={chartData} />
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Insight:</strong> October shows the highest incident count with 25 incidents. 
              Consider increasing security presence during this period.
            </p>
          </div>
        </div>

        {/* Location Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Hotspot Locations</h2>
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </div>
          <LocationBarChart data={locationData} />
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Hotspot Alert:</strong> Cafeteria has 12 incidents this month, marking it as 
              a high-risk area requiring additional monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Incident Breakdown by Type</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Incident Type</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Count</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Percentage</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg Response Time</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">Theft</td>
                <td className="text-center py-3 px-4">28</td>
                <td className="text-center py-3 px-4">25.5%</td>
                <td className="text-center py-3 px-4">12 min</td>
                <td className="text-center py-3 px-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Improving</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">Fight/Altercation</td>
                <td className="text-center py-3 px-4">22</td>
                <td className="text-center py-3 px-4">20.0%</td>
                <td className="text-center py-3 px-4">8 min</td>
                <td className="text-center py-3 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Good</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">Unauthorized Access</td>
                <td className="text-center py-3 px-4">19</td>
                <td className="text-center py-3 px-4">17.3%</td>
                <td className="text-center py-3 px-4">15 min</td>
                <td className="text-center py-3 px-4">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Needs Attention</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">Vandalism</td>
                <td className="text-center py-3 px-4">18</td>
                <td className="text-center py-3 px-4">16.4%</td>
                <td className="text-center py-3 px-4">20 min</td>
                <td className="text-center py-3 px-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Improving</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">Suspicious Activity</td>
                <td className="text-center py-3 px-4">15</td>
                <td className="text-center py-3 px-4">13.6%</td>
                <td className="text-center py-3 px-4">10 min</td>
                <td className="text-center py-3 px-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Good</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">Other</td>
                <td className="text-center py-3 px-4">8</td>
                <td className="text-center py-3 px-4">7.3%</td>
                <td className="text-center py-3 px-4">18 min</td>
                <td className="text-center py-3 px-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Normal</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 border border-purple-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-600" />
          AI-Powered Recommendations
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <p className="text-gray-700">Increase patrol frequency in the Cafeteria during lunch hours (12-2 PM) to address the high incident rate.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <p className="text-gray-700">Install additional CCTV cameras in Parking Lot to improve surveillance coverage.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
            <p className="text-gray-700">Response time for Unauthorized Access incidents is above average. Consider dedicated response team training.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;