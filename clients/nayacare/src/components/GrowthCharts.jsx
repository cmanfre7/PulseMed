import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Baby, Activity, Target, BarChart3, LineChart, PieChart, Brain, Scale, Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';

const GrowthCharts = ({
  babyAgeInDays = 0,
  babyWeight = null,
  babyLength = null,
  babyHeadCircumference = null,
  weightLogs = [],
  lengthLogs = [],
  headCircLogs = [],
  activeBabyId = null,
  babyBirthDate = null
}) => {
  const [selectedChart, setSelectedChart] = useState('weight');
  const [timeframe, setTimeframe] = useState('6months');
  const [isLoading, setIsLoading] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Safety check for logs
  const safeWeightLogs = Array.isArray(weightLogs) ? weightLogs : [];
  const safeLengthLogs = Array.isArray(lengthLogs) ? lengthLogs : [];
  const safeHeadCircLogs = Array.isArray(headCircLogs) ? headCircLogs : [];

  // Log any data issues
  useEffect(() => {
    if (!Array.isArray(weightLogs) || !Array.isArray(lengthLogs) || !Array.isArray(headCircLogs)) {
      console.error('GrowthCharts received invalid log data:', { weightLogs, lengthLogs, headCircLogs });
    }
  }, [weightLogs, lengthLogs, headCircLogs]);

  // WHO Growth Standards Data (simplified for demo) - Weight in lbs, Length/Head Circ in cm
  const growthData = {
    weight: {
      male: {
        0: { p3: 5.5, p10: 6.0, p25: 6.6, p50: 7.3, p75: 8.2, p90: 8.8, p97: 9.7 },
        30: { p3: 7.1, p10: 7.7, p25: 8.6, p50: 9.5, p75: 10.6, p90: 11.5, p97: 12.6 },
        60: { p3: 8.8, p10: 9.7, p25: 10.8, p50: 11.9, p75: 13.2, p90: 14.3, p97: 15.7 },
        90: { p3: 10.6, p10: 11.5, p25: 12.8, p50: 14.1, p75: 15.7, p90: 17.0, p97: 18.5 },
        120: { p3: 11.9, p10: 13.0, p25: 14.3, p50: 15.9, p75: 17.6, p90: 19.2, p97: 20.9 },
        150: { p3: 13.0, p10: 14.1, p25: 15.7, p50: 17.2, p75: 19.2, p90: 20.9, p97: 22.9 },
        180: { p3: 13.9, p10: 15.2, p25: 16.8, p50: 18.5, p75: 20.5, p90: 22.5, p97: 24.7 }
      },
      female: {
        0: { p3: 5.3, p10: 5.7, p25: 6.4, p50: 7.1, p75: 7.9, p90: 8.6, p97: 9.5 },
        30: { p3: 6.6, p10: 7.3, p25: 8.2, p50: 9.0, p75: 10.1, p90: 11.0, p97: 12.1 },
        60: { p3: 8.2, p10: 9.0, p25: 10.1, p50: 11.2, p75: 12.6, p90: 13.7, p97: 15.0 },
        90: { p3: 9.7, p10: 10.8, p25: 11.9, p50: 13.2, p75: 14.8, p90: 16.1, p97: 17.6 },
        120: { p3: 10.8, p10: 11.9, p25: 13.2, p50: 14.8, p75: 16.5, p90: 18.1, p97: 19.8 },
        150: { p3: 11.7, p10: 12.8, p25: 14.3, p50: 16.1, p75: 18.1, p90: 19.8, p97: 21.8 },
        180: { p3: 12.6, p10: 13.7, p25: 15.4, p50: 17.2, p75: 19.4, p90: 21.4, p97: 23.6 }
      }
    },
    length: {
      male: {
        0: { p3: 46.1, p10: 47.8, p25: 49.9, p50: 52.0, p75: 54.1, p90: 56.1, p97: 58.0 },
        30: { p3: 50.8, p10: 52.8, p25: 55.0, p50: 57.1, p75: 59.2, p90: 61.2, p97: 63.2 },
        60: { p3: 54.4, p10: 56.4, p25: 58.6, p50: 60.8, p75: 63.0, p90: 65.1, p97: 67.1 },
        90: { p3: 57.3, p10: 59.4, p25: 61.6, p50: 63.9, p75: 66.1, p90: 68.3, p97: 70.4 },
        120: { p3: 59.7, p10: 61.8, p25: 64.1, p50: 66.4, p75: 68.7, p90: 71.0, p97: 73.2 },
        150: { p3: 61.7, p10: 63.9, p25: 66.2, p50: 68.6, p75: 71.0, p90: 73.4, p97: 75.7 },
        180: { p3: 63.3, p10: 65.6, p25: 68.0, p50: 70.5, p75: 73.0, p90: 75.5, p97: 78.0 }
      },
      female: {
        0: { p3: 45.4, p10: 47.1, p25: 49.1, p50: 51.0, p75: 53.0, p90: 55.0, p97: 56.9 },
        30: { p3: 49.8, p10: 51.7, p25: 53.8, p50: 55.9, p75: 58.0, p90: 60.1, p97: 62.1 },
        60: { p3: 53.2, p10: 55.2, p25: 57.4, p50: 59.6, p75: 61.8, p90: 64.0, p97: 66.1 },
        90: { p3: 55.6, p10: 57.7, p25: 60.0, p50: 62.3, p75: 64.6, p90: 66.9, p97: 69.1 },
        120: { p3: 57.4, p10: 59.6, p25: 62.0, p50: 64.4, p75: 66.8, p90: 69.2, p97: 71.6 },
        150: { p3: 58.9, p10: 61.2, p25: 63.7, p50: 66.2, p75: 68.7, p90: 71.2, p97: 73.7 },
        180: { p3: 60.3, p10: 62.6, p25: 65.2, p50: 67.8, p75: 70.4, p90: 73.0, p97: 75.6 }
      }
    },
    headCircumference: {
      male: {
        0: { p3: 31.9, p10: 32.9, p25: 34.0, p50: 35.0, p75: 36.1, p90: 37.1, p97: 38.1 },
        30: { p3: 35.4, p10: 36.4, p25: 37.5, p50: 38.5, p75: 39.6, p90: 40.6, p97: 41.6 },
        60: { p3: 37.8, p10: 38.8, p25: 39.9, p50: 40.9, p75: 42.0, p90: 43.0, p97: 44.0 },
        90: { p3: 39.5, p10: 40.5, p25: 41.6, p50: 42.6, p75: 43.7, p90: 44.7, p97: 45.7 },
        120: { p3: 40.7, p10: 41.7, p25: 42.8, p50: 43.8, p75: 44.9, p90: 45.9, p97: 46.9 },
        150: { p3: 41.6, p10: 42.6, p25: 43.7, p50: 44.7, p75: 45.8, p90: 46.8, p97: 47.8 },
        180: { p3: 42.3, p10: 43.3, p25: 44.4, p50: 45.4, p75: 46.5, p90: 47.5, p97: 48.5 }
      },
      female: {
        0: { p3: 31.2, p10: 32.2, p25: 33.2, p50: 34.2, p75: 35.2, p90: 36.2, p97: 37.2 },
        30: { p3: 34.5, p10: 35.5, p25: 36.5, p50: 37.5, p75: 38.5, p90: 39.5, p97: 40.5 },
        60: { p3: 36.8, p10: 37.8, p25: 38.8, p50: 39.8, p75: 40.8, p90: 41.8, p97: 42.8 },
        90: { p3: 38.3, p10: 39.3, p25: 40.3, p50: 41.3, p75: 42.3, p90: 43.3, p97: 44.3 },
        120: { p3: 39.4, p10: 40.4, p25: 41.4, p50: 42.4, p75: 43.4, p90: 44.4, p97: 45.4 },
        150: { p3: 40.2, p10: 41.2, p25: 42.2, p50: 43.2, p75: 44.2, p90: 45.2, p97: 46.2 },
        180: { p3: 40.8, p10: 41.8, p25: 42.8, p50: 43.8, p75: 44.8, p90: 45.8, p97: 46.8 }
      }
    }
  };

  const getGrowthPercentile = (value, ageInDays, gender, measurement) => {
    if (!value || !ageInDays) return null;
    
    const ageKey = Math.floor(ageInDays / 30) * 30; // Round to nearest 30 days
    const data = growthData[measurement]?.[gender]?.[ageKey];
    if (!data) return null;

    if (value <= data.p3) return { percentile: 3, status: 'Below 3rd percentile' };
    if (value <= data.p10) return { percentile: 10, status: 'Below 10th percentile' };
    if (value <= data.p25) return { percentile: 25, status: '25th percentile' };
    if (value <= data.p50) return { percentile: 50, status: '50th percentile' };
    if (value <= data.p75) return { percentile: 75, status: '75th percentile' };
    if (value <= data.p90) return { percentile: 90, status: '90th percentile' };
    if (value <= data.p97) return { percentile: 97, status: '97th percentile' };
    return { percentile: 99, status: 'Above 97th percentile' };
  };

  const generateChartData = (measurement, gender = 'male') => {
    const data = growthData[measurement]?.[gender];
    if (!data) return [];

    return Object.entries(data).map(([age, percentiles]) => ({
      age: parseInt(age),
      ...percentiles
    }));
  };

  // Prepare baby's actual measurements for plotting
  const getBabyMeasurements = (measurementType) => {
    let logs = [];
    if (measurementType === 'weight') {
      logs = safeWeightLogs;
    } else if (measurementType === 'length') {
      logs = safeLengthLogs;
    } else if (measurementType === 'headCircumference') {
      logs = safeHeadCircLogs;
    }

    return logs
      .filter(log => log?.babyId === activeBabyId && log?.value && log?.date)
      .map(log => {
        // Calculate baby's age at the time of measurement (not how long ago the measurement was taken)
        const ageAtMeasurement = babyBirthDate
          ? Math.floor((new Date(log.date) - new Date(babyBirthDate)) / (1000 * 60 * 60 * 24))
          : Math.floor((new Date() - new Date(log.date)) / (1000 * 60 * 60 * 24));

        return {
          ageInDays: ageAtMeasurement,
          value: parseFloat(log.value),
          date: log.date,
          id: log.id
        };
      })
      .sort((a, b) => a.ageInDays - b.ageInDays);
  };

  // Merge WHO data with baby's measurements
  const getChartDataWithMeasurements = useMemo(() => {
    const whoData = generateChartData(selectedChart, 'male');
    const babyData = getBabyMeasurements(selectedChart);

    // Create a combined dataset
    const combinedData = [...whoData];

    // Add baby's measurements
    babyData.forEach(measurement => {
      const ageInDays = measurement.ageInDays;
      const existingPoint = combinedData.find(d => d.age === ageInDays);

      if (existingPoint) {
        existingPoint.babyValue = measurement.value;
      } else {
        combinedData.push({
          age: ageInDays,
          babyValue: measurement.value
        });
      }
    });

    return combinedData.sort((a, b) => a.age - b.age);
  }, [selectedChart, safeWeightLogs, safeLengthLogs, safeHeadCircLogs, activeBabyId]);

  const renderGrowthChart = () => {
    const chartData = generateChartData(selectedChart);
    const currentAge = Math.floor(babyAgeInDays / 30) * 30;
    const currentValue = selectedChart === 'weight' ? babyWeight : 
                        selectedChart === 'length' ? babyLength : babyHeadCircumference;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-6 space-y-2 md:space-y-0">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 capitalize">
            {selectedChart} Growth Chart
          </h3>
          <div className="flex space-x-1 md:space-x-2">
            {[
              { key: 'weight', label: 'weight', activeColor: 'bg-pink-100 text-pink-700 border-pink-200', hoverColor: 'hover:bg-pink-50' },
              { key: 'length', label: 'length', activeColor: 'bg-blue-100 text-blue-700 border-blue-200', hoverColor: 'hover:bg-blue-50' },
              { key: 'headCircumference', label: 'Head Circ.', activeColor: 'bg-purple-100 text-purple-700 border-purple-200', hoverColor: 'hover:bg-purple-50' }
            ].map((chart) => (
              <button
                key={chart.key}
                onClick={() => setSelectedChart(chart.key)}
                className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  selectedChart === chart.key
                    ? `${chart.activeColor} border`
                    : `bg-gray-100 text-gray-600 hover:bg-gray-200 ${chart.hoverColor}`
                }`}
              >
                {chart.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 md:h-96 bg-white rounded-lg p-2 md:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={getChartDataWithMeasurements} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="age"
                label={{ value: 'Age (days)', position: 'insideBottom', offset: -5, style: { fontSize: '11px' } }}
                stroke="#6b7280"
                domain={[0, 180]}
                type="number"
                style={{ fontSize: '10px' }}
              />
              <YAxis
                label={{ value: selectedChart === 'weight' ? 'Weight (lbs)' : 'Length (cm)', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
                stroke="#6b7280"
                domain={[0, 'auto']}
                style={{ fontSize: '10px' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '11px' }}
                labelFormatter={(value) => `Age: ${value} days`}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />

              {/* WHO Percentile Curves */}
              <Line type="monotone" dataKey="p3" stroke="#ef4444" strokeWidth={1} dot={false} name="3rd Percentile" strokeDasharray="5 5" connectNulls />
              <Line type="monotone" dataKey="p10" stroke="#f97316" strokeWidth={1} dot={false} name="10th Percentile" strokeDasharray="3 3" connectNulls />
              <Line type="monotone" dataKey="p25" stroke="#eab308" strokeWidth={1.5} dot={false} name="25th Percentile" connectNulls />
              <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={2} dot={false} name="50th Percentile (Median)" connectNulls />
              <Line type="monotone" dataKey="p75" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="75th Percentile" connectNulls />
              <Line type="monotone" dataKey="p90" stroke="#8b5cf6" strokeWidth={1} dot={false} name="90th Percentile" strokeDasharray="3 3" connectNulls />
              <Line type="monotone" dataKey="p97" stroke="#ec4899" strokeWidth={1} dot={false} name="97th Percentile" strokeDasharray="5 5" connectNulls />

              {/* Baby's Actual Measurements */}
              <Line
                type="monotone"
                dataKey="babyValue"
                stroke={selectedChart === 'weight' ? '#db2777' : selectedChart === 'length' ? '#3b82f6' : '#a855f7'}
                strokeWidth={2.5}
                dot={{ fill: selectedChart === 'weight' ? '#db2777' : selectedChart === 'length' ? '#3b82f6' : '#a855f7', r: 4 }}
                name="Your Baby"
                connectNulls={false}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Current Status Summary */}
        <div className="mt-3 md:mt-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 md:p-4 border border-pink-200">
          <h5 className="text-sm md:text-base font-medium text-gray-800 mb-2 md:mb-3 flex items-center">
            <Target className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-pink-600" />
            Latest Measurement
          </h5>
          {getBabyMeasurements(selectedChart).length > 0 ? (
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div>
                <p className="text-sm text-gray-600">Value</p>
                <p className="font-medium text-gray-800">
                  {getBabyMeasurements(selectedChart)[getBabyMeasurements(selectedChart).length - 1]?.value} {selectedChart === 'weight' ? 'lbs' : 'cm'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium text-gray-800">
                  {getBabyMeasurements(selectedChart)[getBabyMeasurements(selectedChart).length - 1]?.ageInDays} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentile</p>
                <p className="font-medium text-pink-600">
                  {getGrowthPercentile(
                    getBabyMeasurements(selectedChart)[getBabyMeasurements(selectedChart).length - 1]?.value,
                    getBabyMeasurements(selectedChart)[getBabyMeasurements(selectedChart).length - 1]?.ageInDays,
                    'male',
                    selectedChart
                  )?.percentile || 'N/A'}th
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No measurements recorded yet. Click "Track Growth Measurement" to add your baby's {selectedChart} data.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderMilestoneTracker = () => {
    const milestones = [
      { age: 0, title: "Newborn", description: "Initial assessments and bonding", icon: "Baby" },
      { age: 30, title: "1 Month", description: "First smiles and social awareness", icon: "Smile" },
      { age: 60, title: "2 Months", description: "Head control and tummy time", icon: "Activity" },
      { age: 90, title: "3 Months", description: "Rolling over and increased mobility", icon: "RotateCcw" },
      { age: 120, title: "4 Months", description: "Sitting with support", icon: "Square" },
      { age: 150, title: "5 Months", description: "Reaching and grasping", icon: "Target" },
      { age: 180, title: "6 Months", description: "Sitting independently", icon: "TrendingUp" }
    ];

    const currentMilestone = milestones.find(m => m.age <= babyAgeInDays) || milestones[0];
    const nextMilestone = milestones.find(m => m.age > babyAgeInDays);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Developmental Milestones</h3>
        
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                <Baby className="w-4 h-4 text-pink-600" />
              </div>
              <h4 className="font-medium text-pink-800">Current Stage</h4>
            </div>
            <p className="text-pink-700 font-medium">{currentMilestone.title}</p>
            <p className="text-sm text-pink-600">{currentMilestone.description}</p>
          </div>

          {nextMilestone && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-blue-800">Next Milestone</h4>
              </div>
              <p className="text-blue-700 font-medium">{nextMilestone.title}</p>
              <p className="text-sm text-blue-600">{nextMilestone.description}</p>
              <p className="text-xs text-blue-500 mt-1">
                Expected around {nextMilestone.age} days old
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Error boundary
  if (renderError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Growth Charts</h2>
          <p className="text-red-600 mb-4">
            There was an error loading the growth tracking data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg p-6 border border-pink-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Growth & Development Tracking</h2>
          <p className="text-gray-600">
            Monitor your baby's growth patterns and developmental milestones with professional-grade tracking tools.
          </p>
        </div>

      <div className="w-full">
        {renderGrowthChart()}
      </div>

      {/* Collapsible Grouped Measurement History */}
      {(safeWeightLogs.length > 0 || safeLengthLogs.length > 0 || safeHeadCircLogs.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-pink-500" />
            Measurement History
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {(() => {
              // Group measurements by groupId or date
              const groupedMeasurements = {};

              // Combine all logs
              const allLogs = [
                ...safeWeightLogs.filter(log => log?.babyId === activeBabyId).map(log => ({ ...log, type: 'weight' })),
                ...safeLengthLogs.filter(log => log?.babyId === activeBabyId).map(log => ({ ...log, type: 'length' })),
                ...safeHeadCircLogs.filter(log => log?.babyId === activeBabyId).map(log => ({ ...log, type: 'headCircumference' }))
              ];

              // Group by groupId or by 10-minute time windows
              allLogs.forEach(log => {
                if (!log || !log.value || !log.date) return;

                // If has groupId, use that. Otherwise group by 10-minute windows
                let key;
                if (log.groupId) {
                  key = log.groupId;
                } else {
                  // Round to nearest 10-minute window for grouping measurements taken close together
                  const logDate = new Date(log.date);
                  const minutes = logDate.getMinutes();
                  const roundedMinutes = Math.floor(minutes / 10) * 10; // Round down to nearest 10-minute interval
                  logDate.setMinutes(roundedMinutes, 0, 0); // Set minutes to 0, 10, 20, 30, 40, or 50, clear seconds/ms
                  key = logDate.toISOString();
                }

                if (!groupedMeasurements[key]) {
                  groupedMeasurements[key] = {
                    date: log.date,
                    groupId: key,
                    measurements: {}
                  };
                }
                groupedMeasurements[key].measurements[log.type] = log;
              });

              // Convert to array and sort by date (most recent first)
              const sortedGroups = Object.values(groupedMeasurements)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10); // Show last 10 measurement groups

              return sortedGroups.map((group) => {
                const { weight, length, headCircumference } = group.measurements;
                const measurementCount = [weight, length, headCircumference].filter(Boolean).length;
                const isExpanded = expandedGroups[group.groupId];

                // Calculate age at measurement time
                const measurementDate = new Date(group.date);
                const birthDate = babyBirthDate ? new Date(babyBirthDate) : null;
                const ageAtMeasurement = birthDate
                  ? Math.floor((measurementDate - birthDate) / (1000 * 60 * 60 * 24))
                  : babyAgeInDays;

                // Get percentiles for each measurement
                const weightPercentile = weight ? getGrowthPercentile(weight.value, ageAtMeasurement, 'male', 'weight') : null;
                const lengthPercentile = length ? getGrowthPercentile(length.value, ageAtMeasurement, 'male', 'length') : null;
                const headPercentile = headCircumference ? getGrowthPercentile(headCircumference.value, ageAtMeasurement, 'male', 'headCircumference') : null;

                return (
                  <div key={group.groupId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Collapsed Header */}
                    <button
                      onClick={() => setExpandedGroups(prev => ({ ...prev, [group.groupId]: !prev[group.groupId] }))}
                      className="w-full p-4 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Activity className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(group.date).toLocaleDateString()} at {new Date(group.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {measurementCount} {measurementCount === 1 ? 'measurement' : 'measurements'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {isExpanded ? 'Hide details' : 'View details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-4 bg-white space-y-3">
                        {weight && (
                          <div className="flex items-start space-x-3 p-3 bg-pink-50 rounded-lg">
                            <Scale className="w-5 h-5 text-pink-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">Weight</p>
                              <p className="text-lg font-bold text-pink-600">{weight.value} lbs</p>
                              {weightPercentile && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {weightPercentile.percentile}th percentile - {weightPercentile.status}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {length && (
                          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Ruler className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">Length</p>
                              <p className="text-lg font-bold text-blue-600">{length.value} cm</p>
                              {lengthPercentile && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {lengthPercentile.percentile}th percentile - {lengthPercentile.status}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {headCircumference && (
                          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                            <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">Head Circumference</p>
                              <p className="text-lg font-bold text-purple-600">{headCircumference.value} cm</p>
                              {headPercentile && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {headPercentile.percentile}th percentile - {headPercentile.status}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
    );
  } catch (error) {
    console.error('GrowthCharts render error:', error);
    setRenderError(error.message);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Growth Charts</h2>
          <p className="text-red-600 mb-4">
            There was an error loading the growth tracking data. Please try refreshing the page.
          </p>
          <p className="text-sm text-red-500 mb-4">Error: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default GrowthCharts;
