import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';

const SatisfactionSurvey = ({ onClose, onSubmit, sessionData }) => {
  const [ratings, setRatings] = useState({
    ease_of_use: 0,
    response_quality: 0,
    felt_supported: 0,
    trust_guidance: 0,
    likelihood_recommend: 0
  });

  const [hoveredQuestion, setHoveredQuestion] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const questions = [
    {
      id: 'ease_of_use',
      text: 'How easy was it to chat with Naya?',
      label: '(1 = Very Difficult, 5 = Very Easy)'
    },
    {
      id: 'response_quality',
      text: 'How would you rate the quality of Naya\'s responses and resources?',
      label: '(1 = Poor, 5 = Excellent)'
    },
    {
      id: 'felt_supported',
      text: 'Naya helped me feel supported during this postpartum period.',
      label: '(1 = Strongly Disagree, 5 = Strongly Agree)'
    },
    {
      id: 'trust_guidance',
      text: 'I would trust Naya\'s guidance for future questions.',
      label: '(1 = Strongly Disagree, 5 = Strongly Agree)'
    },
    {
      id: 'likelihood_recommend',
      text: 'How likely are you to recommend NayaCare to other new parents?',
      label: '(1 = Not at All Likely, 5 = Extremely Likely)'
    }
  ];

  const handleStarClick = (questionId, starValue) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: starValue
    }));
  };

  const handleSubmit = async () => {
    // Check if at least one rating is provided
    const hasRatings = Object.values(ratings).some(rating => rating > 0);

    if (!hasRatings) {
      alert('Please provide at least one rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    const surveyData = {
      ...ratings,
      improvement_suggestions: feedback.trim() || null,
      session_duration_seconds: sessionData.duration,
      message_count: sessionData.messageCount,
      user_email: sessionData.userEmail || 'anonymous',
      baby_profile_id: sessionData.babyProfileId || null,
      platform: sessionData.isEmbed ? 'embed' : 'web',
      chatbot_version: '1.9.5',
      survey_version: 'v1.1',
      // Feature usage tracking
      ...sessionData.featureUsage,
      resources_viewed_list: sessionData.featureUsage?.resources_viewed?.join(', ') || ''
    };

    try {
      await onSubmit(surveyData);
      setShowThankYou(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('Failed to submit survey. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Track that user skipped (for analytics)
    const skipData = {
      survey_skipped: true,
      session_duration_seconds: sessionData.duration,
      message_count: sessionData.messageCount,
      user_email: sessionData.userEmail || 'anonymous',
      platform: sessionData.isEmbed ? 'embed' : 'web'
    };

    // Send skip event (optional - can be useful for analytics)
    fetch('/api/survey/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skipData)
    }).catch(err => console.error('Failed to log skip:', err));

    onClose();
  };

  if (showThankYou) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fadeIn">
          <div className="text-6xl mb-4">💖</div>
          <h2 className="text-2xl font-bold text-pink-600 mb-3">Thank You!</h2>
          <p className="text-gray-700">
            Your feedback helps us improve NayaCare for new parents like you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-xl w-full max-h-[95vh] overflow-y-auto my-2 sm:my-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl z-10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">🌸 Help Us Improve NayaCare</h2>
              <p className="text-pink-100 text-xs sm:text-sm">
                Your feedback helps us support new parents like you! (Takes ~1 minute)
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:bg-pink-700 rounded-full p-1.5 transition-colors flex-shrink-0"
              aria-label="Close survey"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Survey Questions */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <span className="font-semibold text-pink-600 flex-shrink-0 text-sm">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{question.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{question.label}</p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1.5 ml-5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentRating = ratings[question.id];
                  const isHovered = hoveredQuestion === question.id && hoveredStar >= star;
                  const isSelected = currentRating >= star;

                  // Use inline styles to bypass Tailwind purge completely
                  let fillColor, strokeColor;
                  if (isHovered) {
                    fillColor = '#fcd34d'; // yellow-300
                    strokeColor = '#fbbf24'; // yellow-400
                  } else if (isSelected) {
                    fillColor = '#fbbf24'; // yellow-400
                    strokeColor = '#f59e0b'; // yellow-500
                  } else {
                    fillColor = '#e5e7eb'; // gray-200
                    strokeColor = '#d1d5db'; // gray-300
                  }

                  return (
                    <button
                      key={star}
                      onClick={() => handleStarClick(question.id, star)}
                      onMouseEnter={() => {
                        setHoveredQuestion(question.id);
                        setHoveredStar(star);
                      }}
                      onMouseLeave={() => {
                        setHoveredQuestion(null);
                        setHoveredStar(null);
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-pink-500 rounded transition-transform hover:scale-110"
                      aria-label={`Rate ${star} out of 5`}
                    >
                      <Star
                        size={28}
                        style={{
                          fill: fillColor,
                          stroke: strokeColor,
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </button>
                  );
                })}
                <span className="ml-1 text-xs text-gray-600 font-medium">
                  {ratings[question.id] > 0 ? `${ratings[question.id]}/5` : ''}
                </span>
              </div>
            </div>
          ))}

          {/* Open-Ended Feedback */}
          <div className="space-y-1.5 pt-2 sm:pt-3 border-t border-gray-200">
            <label className="flex items-center gap-1.5 font-medium text-gray-800 text-sm">
              <span>💬</span>
              <span>How can we improve NayaCare? (Optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Your suggestions help us improve..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm"
            />
            <p className="text-xs text-gray-500 text-right">
              {feedback.length}/300 characters
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-3 sm:px-4 py-3 rounded-b-xl sm:rounded-b-2xl flex items-center justify-between gap-2 sm:gap-4 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
            disabled={isSubmitting}
          >
            Skip for Now
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="hidden sm:inline">Submitting...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionSurvey;
