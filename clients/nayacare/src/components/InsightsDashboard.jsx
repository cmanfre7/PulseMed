import React, { useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, Baby, Droplets, Moon, Sun, Calendar, BarChart3, Zap, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const InsightsDashboard = ({
  feedingLogs = [],
  sleepLogs = [],
  diaperLogs = [],
  babyAgeInDays = 0,
  babyAgeInWeeks = 0
}) => {
  // Calculate insights
  const insights = useMemo(() => {
    const now = new Date();
    const last24Hours = feedingLogs.filter(log =>
      (now - new Date(log.timestamp)) / (1000 * 60 * 60) <= 24
    );
    const last7Days = feedingLogs.filter(log =>
      (now - new Date(log.timestamp)) / (1000 * 60 * 60 * 24) <= 7
    );

    const sleepLast24Hours = sleepLogs.filter(log =>
      (now - new Date(log.timestamp)) / (1000 * 60 * 60) <= 24
    );
    const sleepLast7Days = sleepLogs.filter(log =>
      (now - new Date(log.timestamp)) / (1000 * 60 * 60 * 24) <= 7
    );

    const diapersLast24Hours = diaperLogs.filter(log =>
      (now - new Date(log.timestamp)) / (1000 * 60 * 60) <= 24
    );

    // Calculate total sleep in last 24 hours
    const totalSleep24h = sleepLast24Hours.reduce((sum, log) => sum + (log.duration || 0), 0);

    // Expected ranges based on age
    const getExpectedRanges = (ageInWeeks) => {
      if (ageInWeeks < 4) {
        return { feeds: [8, 12], sleep: [14, 17], wetDiapers: [6, 8], dirtyDiapers: [3, 4] };
      } else if (ageInWeeks < 12) {
        return { feeds: [6, 8], sleep: [14, 16], wetDiapers: [5, 7], dirtyDiapers: [2, 4] };
      } else {
        return { feeds: [5, 6], sleep: [13, 15], wetDiapers: [5, 6], dirtyDiapers: [1, 3] };
      }
    };

    const expected = getExpectedRanges(babyAgeInWeeks);

    return {
      feedsToday: last24Hours.length,
      avgFeedsPerDay: last7Days.length / 7,
      sleepHoursToday: totalSleep24h / 60,
      wetDiapersToday: diapersLast24Hours.filter(d => d.type === 'wet' || d.type === 'both').length,
      dirtyDiapersToday: diapersLast24Hours.filter(d => d.type === 'dirty' || d.type === 'both').length,
      expected
    };
  }, [feedingLogs, sleepLogs, diaperLogs, babyAgeInWeeks]);

  // Generate weekly trend data
  const weeklyTrends = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayFeedings = feedingLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDate;
      });

      const daySleep = sleepLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDate;
      });

      const dayDiapers = diaperLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= date && logDate < nextDate;
      });

      const totalSleep = daySleep.reduce((sum, log) => sum + (log.duration || 0), 0) / 60;

      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        feeds: dayFeedings.length,
        sleep: parseFloat(totalSleep.toFixed(1)),
        diapers: dayDiapers.length
      });
    }

    return days;
  }, [feedingLogs, sleepLogs, diaperLogs]);

  // Detect patterns
  const patterns = useMemo(() => {
    // Get last 20 feedings to analyze recent patterns
    const recentFeedings = feedingLogs.slice(-20);

    if (recentFeedings.length === 0) {
      return {
        peakFeedingTime: 'Not enough data',
        longestSleepStretch: '0h 0m'
      };
    }

    // Count feedings per hour
    const hourCounts = {};
    recentFeedings.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find the hour(s) with the most feedings
    const sortedHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1]); // Sort by count (highest first)

    // Get the maximum count
    const maxCount = sortedHours.length > 0 ? sortedHours[0][1] : 0;

    // Only show peak if there are at least 2 feedings in that hour
    const peakFeedingTime = maxCount >= 2
      ? `${sortedHours[0][0]}:00 - ${parseInt(sortedHours[0][0]) + 1}:00`
      : 'No clear pattern yet';

    const longestSleep = sleepLogs.length > 0
      ? Math.max(...sleepLogs.slice(-10).map(log => log.duration || 0))
      : 0;

    return {
      peakFeedingTime,
      longestSleepStretch: `${Math.floor(longestSleep / 60)}h ${longestSleep % 60}m`
    };
  }, [feedingLogs, sleepLogs]);

  const getStatusColor = (actual, expected) => {
    if (actual >= expected[0] && actual <= expected[1]) return 'text-green-600';
    if (actual < expected[0]) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getStatusIcon = (actual, expected) => {
    if (actual >= expected[0] && actual <= expected[1]) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (actual < expected[0]) return <AlertCircle className="w-5 h-5 text-orange-500" />;
    return <TrendingUp className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Today's Summary - Hero Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {/* Feeding Card */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-pink-200 shadow-sm md:shadow-lg md:hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="p-1.5 md:p-3 bg-pink-500 rounded-md md:rounded-lg">
              <Droplets className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden md:block">
              {getStatusIcon(insights.feedsToday, insights.expected.feeds)}
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-pink-800 mb-0.5 md:mb-1">Feedings</h3>
          <div className="flex items-baseline space-x-1 md:space-x-2">
            <p className={`text-xl md:text-3xl font-bold ${getStatusColor(insights.feedsToday, insights.expected.feeds)}`}>
              {insights.feedsToday}
            </p>
            <p className="text-xs md:text-sm text-pink-600">/ {insights.expected.feeds[0]}-{insights.expected.feeds[1]}</p>
          </div>
          <p className="text-[10px] md:text-xs text-pink-600 mt-1 md:mt-2 hidden md:block">Expected for {babyAgeInWeeks} weeks old</p>
        </div>

        {/* Sleep Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-indigo-200 shadow-sm md:shadow-lg md:hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="p-1.5 md:p-3 bg-indigo-500 rounded-md md:rounded-lg">
              <Moon className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden md:block">
              {getStatusIcon(insights.sleepHoursToday, insights.expected.sleep)}
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-indigo-800 mb-0.5 md:mb-1">Sleep</h3>
          <div className="flex items-baseline space-x-1 md:space-x-2">
            <p className={`text-xl md:text-3xl font-bold ${getStatusColor(insights.sleepHoursToday, insights.expected.sleep)}`}>
              {insights.sleepHoursToday.toFixed(1)}
            </p>
            <p className="text-xs md:text-sm text-indigo-600">hrs</p>
          </div>
          <p className="text-[10px] md:text-xs text-indigo-600 mt-1 md:mt-2 hidden md:block">Expected: {insights.expected.sleep[0]}-{insights.expected.sleep[1]}h</p>
        </div>

        {/* Wet Diapers Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-blue-200 shadow-sm md:shadow-lg md:hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="p-1.5 md:p-3 bg-blue-500 rounded-md md:rounded-lg">
              <Droplets className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden md:block">
              {getStatusIcon(insights.wetDiapersToday, insights.expected.wetDiapers)}
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-blue-800 mb-0.5 md:mb-1">Wet</h3>
          <div className="flex items-baseline space-x-1 md:space-x-2">
            <p className={`text-xl md:text-3xl font-bold ${getStatusColor(insights.wetDiapersToday, insights.expected.wetDiapers)}`}>
              {insights.wetDiapersToday}
            </p>
            <p className="text-xs md:text-sm text-blue-600">today</p>
          </div>
          <p className="text-[10px] md:text-xs text-blue-600 mt-1 md:mt-2 hidden md:block">Hydration indicator</p>
        </div>

        {/* Dirty Diapers Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-amber-200 shadow-sm md:shadow-lg md:hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="p-1.5 md:p-3 bg-amber-500 rounded-md md:rounded-lg">
              <Baby className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden md:block">
              {getStatusIcon(insights.dirtyDiapersToday, insights.expected.dirtyDiapers)}
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-medium text-amber-800 mb-0.5 md:mb-1">Dirty</h3>
          <div className="flex items-baseline space-x-1 md:space-x-2">
            <p className={`text-xl md:text-3xl font-bold ${getStatusColor(insights.dirtyDiapersToday, insights.expected.dirtyDiapers)}`}>
              {insights.dirtyDiapersToday}
            </p>
            <p className="text-xs md:text-sm text-amber-600">today</p>
          </div>
          <p className="text-[10px] md:text-xs text-amber-600 mt-1 md:mt-2 hidden md:block">Nutrition indicator</p>
        </div>
      </div>

      {/* Weekly Trends Chart */}
      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-200 shadow-sm md:shadow-lg">
        <h3 className="text-sm md:text-lg font-semibold text-gray-800 mb-2 md:mb-4 flex items-center">
          <BarChart3 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-purple-500" />
          7-Day Trends
        </h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="feeds" stroke="#ec4899" fill="#fce7f3" name="Feeds" strokeWidth={2} />
              <Area type="monotone" dataKey="sleep" stroke="#6366f1" fill="#e0e7ff" name="Sleep" strokeWidth={2} />
              <Area type="monotone" dataKey="diapers" stroke="#f59e0b" fill="#fef3c7" name="Diapers" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-purple-200 shadow-sm md:shadow-lg">
          <div className="flex items-center mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-purple-500 rounded-md md:rounded-lg mr-2 md:mr-3">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-purple-800">Feeding Pattern</h3>
          </div>
          <p className="text-lg md:text-2xl font-bold text-purple-700 mb-1 md:mb-2">{patterns.peakFeedingTime}</p>
          <p className="text-xs md:text-sm text-purple-600">Peak feeding time</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-teal-200 shadow-sm md:shadow-lg">
          <div className="flex items-center mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-teal-500 rounded-md md:rounded-lg mr-2 md:mr-3">
              <Moon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h3 className="text-sm md:text-lg font-semibold text-teal-800">Sleep Pattern</h3>
          </div>
          <p className="text-lg md:text-2xl font-bold text-teal-700 mb-1 md:mb-2">{patterns.longestSleepStretch}</p>
          <p className="text-xs md:text-sm text-teal-600">Longest sleep stretch</p>
        </div>
      </div>

      {/* Age-Appropriate Insights */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-gray-700 rounded-lg mr-3">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Personalized Insights for {babyAgeInWeeks} Weeks Old</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">✓ What's Normal</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {insights.expected.feeds[0]}-{insights.expected.feeds[1]} feedings per day</li>
              <li>• {insights.expected.sleep[0]}-{insights.expected.sleep[1]} hours of sleep</li>
              <li>• {insights.expected.wetDiapers[0]}+ wet diapers (hydration check)</li>
              <li>• {insights.expected.dirtyDiapers[0]}-{insights.expected.dirtyDiapers[1]} dirty diapers</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">💡 Tips for This Age</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {babyAgeInWeeks < 4 && (
                <>
                  <li>• Feed on demand, watch for hunger cues</li>
                  <li>• Sleep in 2-3 hour stretches is normal</li>
                  <li>• Cluster feeding in evenings is common</li>
                </>
              )}
              {babyAgeInWeeks >= 4 && babyAgeInWeeks < 12 && (
                <>
                  <li>• Longer sleep stretches emerging</li>
                  <li>• Feeding becoming more efficient</li>
                  <li>• Start noticing daily patterns</li>
                </>
              )}
              {babyAgeInWeeks >= 12 && (
                <>
                  <li>• Sleep consolidating at night</li>
                  <li>• 4-5 hour stretches possible</li>
                  <li>• More predictable routines</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;
