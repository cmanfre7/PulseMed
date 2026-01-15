import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, TrendingUp, Baby, Activity, Heart, Brain, Eye, Hand } from 'lucide-react';

const AgeTimeline = ({ babyAgeInDays = 0 }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [timelineData, setTimelineData] = useState(null);

  // Comprehensive age-based timeline data
  const getTimelineData = (ageInDays) => {
    const ageInWeeks = Math.floor(ageInDays / 7);
    const ageInMonths = Math.floor(ageInDays / 30);

    const timeline = {
      current: {
        title: "Current Stage",
        age: `${ageInDays} days (${ageInWeeks} weeks)`,
        milestones: getCurrentMilestones(ageInDays),
        expectations: getCurrentExpectations(ageInDays),
        tips: getCurrentTips(ageInDays),
        concerns: getCurrentConcerns(ageInDays)
      },
      next: {
        title: "Next 2 Weeks",
        age: `${ageInDays + 14} days`,
        milestones: getNextMilestones(ageInDays, 14),
        expectations: getNextExpectations(ageInDays, 14),
        tips: getNextTips(ageInDays, 14)
      },
      month: {
        title: "Next Month",
        age: `${ageInDays + 30} days`,
        milestones: getNextMilestones(ageInDays, 30),
        expectations: getNextExpectations(ageInDays, 30),
        tips: getNextTips(ageInDays, 30)
      }
    };

    return timeline;
  };

  const getCurrentMilestones = (ageInDays) => {
    if (ageInDays <= 7) {
      return [
        { icon: "Baby", title: "Newborn Reflexes", description: "Rooting, sucking, grasping reflexes active" },
        { icon: "Eye", title: "Visual Focus", description: "Can focus on faces 8-12 inches away" },
        { icon: "Heart", title: "Bonding", description: "Recognizes mother's voice and smell" }
      ];
    } else if (ageInDays <= 30) {
      return [
        { icon: "Smile", title: "First Smiles", description: "Social smiles begin to appear" },
        { icon: "Activity", title: "Head Control", description: "Brief head lifting during tummy time" },
        { icon: "Hand", title: "Hand Awareness", description: "Notices hands and brings them to mouth" }
      ];
    } else if (ageInDays <= 60) {
      return [
        { icon: "Activity", title: "Tummy Time", description: "Can lift head 45 degrees during tummy time" },
        { icon: "Eye", title: "Visual Tracking", description: "Follows objects with eyes" },
        { icon: "Hand", title: "Grasping", description: "Begins to grasp objects placed in hand" }
      ];
    } else if (ageInDays <= 90) {
      return [
        { icon: "Activity", title: "Rolling Over", description: "May roll from tummy to back" },
        { icon: "Hand", title: "Reaching", description: "Reaches for objects within sight" },
        { icon: "Brain", title: "Social Interaction", description: "Responds to familiar faces with excitement" }
      ];
    } else if (ageInDays <= 120) {
      return [
        { icon: "Activity", title: "Sitting Support", description: "Sits with support, head steady" },
        { icon: "Hand", title: "Hand Transfer", description: "Transfers objects between hands" },
        { icon: "Brain", title: "Object Permanence", description: "Begins to understand objects exist when hidden" }
      ];
    } else if (ageInDays <= 150) {
      return [
        { icon: "Activity", title: "Independent Sitting", description: "Sits without support for short periods" },
        { icon: "Hand", title: "Pincer Grasp", description: "Uses thumb and finger to pick up small objects" },
        { icon: "Brain", title: "Stranger Awareness", description: "May show stranger anxiety" }
      ];
    } else {
      return [
        { icon: "Activity", title: "Crawling", description: "May begin crawling or scooting" },
        { icon: "Hand", title: "Fine Motor", description: "Improved hand-eye coordination" },
        { icon: "Brain", title: "Communication", description: "Babbling and vocal play increases" }
      ];
    }
  };

  const getCurrentExpectations = (ageInDays) => {
    if (ageInDays <= 7) {
      return [
        "Sleep 14-17 hours per day in 2-4 hour stretches",
        "Feed every 2-3 hours (8-12 times per day)",
        "May lose 5-10% of birth weight initially",
        "Frequent diaper changes (6+ per day)"
      ];
    } else if (ageInDays <= 30) {
      return [
        "Sleep patterns becoming more predictable",
        "Weight gain of 4-7 ounces per week",
        "Increased alertness during wake periods",
        "May begin to sleep longer stretches at night"
      ];
    } else if (ageInDays <= 60) {
      return [
        "More consistent sleep schedule",
        "Weight gain of 5-8 ounces per week",
        "Increased social interaction",
        "May begin to sleep 4-6 hour stretches"
      ];
    } else if (ageInDays <= 90) {
      return [
        "Sleep 12-15 hours per day with longer night stretches",
        "Weight gain of 4-6 ounces per week",
        "Increased mobility and exploration",
        "More predictable feeding schedule"
      ];
    } else {
      return [
        "Sleep 11-14 hours per day with 2-3 naps",
        "Weight gain of 3-5 ounces per week",
        "Increased independence and mobility",
        "More complex social interactions"
      ];
    }
  };

  const getCurrentTips = (ageInDays) => {
    if (ageInDays <= 7) {
      return [
        "Practice skin-to-skin contact frequently",
        "Follow baby's feeding cues rather than strict schedules",
        "Keep the environment calm and quiet",
        "Track feeding and sleep patterns"
      ];
    } else if (ageInDays <= 30) {
      return [
        "Start tummy time for 1-2 minutes several times daily",
        "Talk and sing to your baby frequently",
        "Establish a bedtime routine",
        "Respond to your baby's cues promptly"
      ];
    } else if (ageInDays <= 60) {
      return [
        "Increase tummy time to 3-5 minutes",
        "Provide age-appropriate toys for exploration",
        "Encourage visual tracking with colorful objects",
        "Support head and neck during all activities"
      ];
    } else if (ageInDays <= 90) {
      return [
        "Supervise rolling practice on safe surfaces",
        "Provide toys that encourage reaching and grasping",
        "Read books with high-contrast images",
        "Encourage social interaction with family members"
      ];
    } else {
      return [
        "Create safe spaces for sitting practice",
        "Provide toys that promote fine motor skills",
        "Encourage crawling and movement",
        "Continue reading and talking to your baby"
      ];
    }
  };

  const getCurrentConcerns = (ageInDays) => {
    if (ageInDays <= 7) {
      return [
        "Excessive crying (more than 3 hours daily)",
        "Difficulty feeding or latching",
        "Signs of dehydration (fewer wet diapers)",
        "Temperature above 100.4°F or below 97°F"
      ];
    } else if (ageInDays <= 30) {
      return [
        "Not gaining weight appropriately",
        "Excessive sleepiness or difficulty waking",
        "Persistent feeding difficulties",
        "Unusual breathing patterns"
      ];
    } else {
      return [
        "Not meeting expected milestones",
        "Loss of previously acquired skills",
        "Excessive fussiness or irritability",
        "Concerns about development or growth"
      ];
    }
  };

  const getNextMilestones = (ageInDays, daysAhead) => {
    const futureAge = ageInDays + daysAhead;
    return getCurrentMilestones(futureAge);
  };

  const getNextExpectations = (ageInDays, daysAhead) => {
    const futureAge = ageInDays + daysAhead;
    return getCurrentExpectations(futureAge);
  };

  const getNextTips = (ageInDays, daysAhead) => {
    const futureAge = ageInDays + daysAhead;
    return getCurrentTips(futureAge);
  };

  useEffect(() => {
    setTimelineData(getTimelineData(babyAgeInDays));
  }, [babyAgeInDays]);

  if (!timelineData) return null;

  const currentData = timelineData[selectedTimeframe];

  const iconMap = {
    Baby,
    Eye,
    Heart,
    Smile: Activity,
    Activity,
    Hand,
    Brain
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Age-Specific Timeline</h2>
        <p className="text-gray-600">
          Personalized developmental guidance based on your baby's current age of {babyAgeInDays} days
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2 bg-white rounded-lg border border-gray-200 p-2">
        {Object.entries(timelineData).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setSelectedTimeframe(key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe === key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {data.title}
          </button>
        ))}
      </div>

      {/* Current Timeline Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{currentData.title}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {currentData.age}
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            Key Milestones
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentData.milestones.map((milestone, index) => {
              const IconComponent = iconMap[milestone.icon] || Baby;
              return (
                <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-blue-800">{milestone.title}</h5>
                  </div>
                  <p className="text-sm text-blue-600">{milestone.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expectations */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-500" />
            What to Expect
          </h4>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <ul className="space-y-2">
              {currentData.expectations.map((expectation, index) => (
                <li key={index} className="flex items-start text-sm text-green-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {expectation}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
            Support Tips
          </h4>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <ul className="space-y-2">
              {currentData.tips.map((tip, index) => (
                <li key={index} className="flex items-start text-sm text-purple-700">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Concerns */}
        {currentData.concerns && (
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              When to Seek Help
            </h4>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <ul className="space-y-2">
                {currentData.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start text-sm text-red-700">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-700 mb-4">Additional Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">Growth Tracking</h5>
            <p className="text-sm text-gray-600 mb-3">
              Monitor your baby's growth patterns and developmental progress
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View Growth Charts →
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">Expert Guidance</h5>
            <p className="text-sm text-gray-600 mb-3">
              Access Dr. Sonal Patel's specialized guidance for your baby's age
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Get Personalized Advice →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeTimeline;
