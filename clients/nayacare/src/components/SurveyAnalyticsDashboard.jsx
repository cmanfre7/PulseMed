import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Star, Users, Clock, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

const SurveyAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/survey-analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analytics || !analytics.allSurveys) return;

    const headers = [
      'Survey ID',
      'User Email',
      'Ease of Use',
      'Response Quality',
      'Felt Supported',
      'Trust Guidance',
      'Likelihood to Recommend',
      'Overall Score',
      'Improvement Suggestions',
      'Session Duration (seconds)',
      'Message Count',
      'Platform',
      'Survey Skipped',
      'Submitted At',
      // Feature Usage
      'Used Chat',
      'Used Feeding Log',
      'Used Sleep Log',
      'Used Diaper Log',
      'Used Growth Charts',
      'Downloaded Resource',
      'Visited YouTube',
      'Resources Viewed',
      // Consent Data (NAY-9)
      'Has Consented',
      'Consent Date',
      'Consent Version'
    ];

    const rows = analytics.allSurveys.map(survey => {
      const overallScore = survey.surveySkipped ? 'N/A' : (
        ((survey.easeOfUse + survey.responseQuality + survey.feltSupported + survey.trustGuidance + survey.likelihoodRecommend) / 5).toFixed(1)
      );

      return [
        survey.surveyId,
        survey.userEmail,
        survey.easeOfUse || 'N/A',
        survey.responseQuality || 'N/A',
        survey.feltSupported || 'N/A',
        survey.trustGuidance || 'N/A',
        survey.likelihoodRecommend || 'N/A',
        overallScore,
        `"${(survey.improvementSuggestions || '').replace(/"/g, '""')}"`,
        survey.sessionDuration,
        survey.messageCount,
        survey.platform,
        survey.surveySkipped ? 'Yes' : 'No',
        survey.submittedAt,
        // Feature usage
        survey.usedChat ? 'Yes' : 'No',
        survey.usedFeedingLog ? 'Yes' : 'No',
        survey.usedSleepLog ? 'Yes' : 'No',
        survey.usedDiaperLog ? 'Yes' : 'No',
        survey.usedGrowthCharts ? 'Yes' : 'No',
        survey.downloadedResource ? 'Yes' : 'No',
        survey.visitedYoutube ? 'Yes' : 'No',
        `"${(survey.resourcesViewedList || '').replace(/"/g, '""')}"`,
        // Consent data (NAY-9)
        survey.hasConsented ? 'Yes' : 'No',
        survey.consentDate || 'N/A',
        survey.consentVersion || 'N/A'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const filename = `nayacare_survey_results_${new Date().toISOString().split('T')[0]}.csv`;

    // Check if we're in embed mode (iframe)
    const isInIframe = window !== window.top;

    if (isInIframe) {
      // In embed mode, send CSV data to parent window
      window.parent.postMessage({
        type: 'DOWNLOAD_CSV',
        content: csvContent,
        filename: filename
      }, '*');
    } else {
      // Direct mode - download normally
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 stroke-yellow-500' : 'fill-gray-200 stroke-gray-300'}
          />
        ))}
        <span className="ml-1.5 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error loading analytics: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || analytics.totalResponses === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <Users className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Survey Data Yet</h3>
        <p className="text-gray-600">Survey responses will appear here once users start submitting feedback.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Satisfaction Survey Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pilot Study Data Collection • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Download size={18} />
          Export to CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.totalResponses}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{analytics.completionRate}%</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.completedSurveys} completed, {analytics.skippedSurveys} skipped
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Satisfaction</p>
              <p className="text-2xl font-bold text-pink-600 mt-1">{analytics.overallSatisfaction.toFixed(1)}/5</p>
            </div>
            <TrendingUp className="text-pink-500" size={32} />
          </div>
          {renderStars(analytics.overallSatisfaction)}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Session Time</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {Math.floor(analytics.sessionMetrics.averageDuration / 60)}m {analytics.sessionMetrics.averageDuration % 60}s
              </p>
            </div>
            <Clock className="text-purple-500" size={32} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ~{analytics.sessionMetrics.averageMessages.toFixed(1)} messages avg.
          </p>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="text-yellow-500" size={20} />
          Average Ratings by Question
        </h3>
        <div className="space-y-4">
          {[
            { key: 'ease_of_use', label: 'Ease of Use' },
            { key: 'response_quality', label: 'Response Quality' },
            { key: 'felt_supported', label: 'Felt Supported' },
            { key: 'trust_guidance', label: 'Trust Guidance' },
            { key: 'likelihood_recommend', label: 'Likelihood to Recommend' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
              <div className="flex items-center gap-4">
                {renderStars(analytics.averageRatings[key])}
                <span className="text-xs text-gray-500 w-16 text-right">
                  ({analytics.completedSurveys} responses)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback */}
      {analytics.recentFeedback.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="text-blue-500" size={20} />
            Recent Feedback Comments
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analytics.recentFeedback.map((item, index) => (
              <div key={index} className="border-l-4 border-pink-400 bg-pink-50 p-3 rounded-r">
                <p className="text-sm text-gray-800 italic">"{item.feedback}"</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{item.userEmail}</span>
                  <span>•</span>
                  <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{analytics.platformBreakdown.web}</p>
            <p className="text-sm text-gray-600 mt-1">Web Platform</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{analytics.platformBreakdown.embed}</p>
            <p className="text-sm text-gray-600 mt-1">Embedded Widget</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalyticsDashboard;
