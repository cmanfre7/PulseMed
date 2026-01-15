import React, { useState } from 'react';
import { X, Scale, Ruler, Brain, Calendar, Save, AlertCircle, Zap } from 'lucide-react';

const GrowthMeasurementModal = ({
  isOpen,
  onClose,
  onSave,
  activeBabyProfile,
  babyGender = 'male'
}) => {
  const [weightValue, setWeightValue] = useState('');
  const [lengthValue, setLengthValue] = useState('');
  const [headCircValue, setHeadCircValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [quickLogMode, setQuickLogMode] = useState(false);

  if (!isOpen) return null;

  const measurementConfigs = {
    weight: {
      label: 'Weight',
      unit: 'lbs',
      icon: Scale,
      placeholder: 'e.g., 11.5',
      min: 2,
      max: 33,
      step: 0.1,
      color: 'pink',
      value: weightValue,
      setValue: setWeightValue
    },
    length: {
      label: 'Length',
      unit: 'cm',
      icon: Ruler,
      placeholder: 'e.g., 62.5',
      min: 40,
      max: 100,
      step: 0.1,
      color: 'blue',
      value: lengthValue,
      setValue: setLengthValue
    },
    headCircumference: {
      label: 'Head Circumference',
      unit: 'cm',
      icon: Brain,
      placeholder: 'e.g., 40.5',
      min: 30,
      max: 55,
      step: 0.1,
      color: 'purple',
      value: headCircValue,
      setValue: setHeadCircValue
    }
  };

  const validateValue = (val, config) => {
    if (!val) return null; // Empty is OK in quick log mode
    const num = parseFloat(val);
    if (isNaN(num)) {
      return `${config.label}: Please enter a valid number`;
    }
    if (num < config.min || num > config.max) {
      return `${config.label}: Must be between ${config.min} and ${config.max} ${config.unit}`;
    }
    return null;
  };

  const handleSave = async () => {
    setError('');

    // Validate all fields
    const errors = [];
    Object.values(measurementConfigs).forEach(config => {
      const err = validateValue(config.value, config);
      if (err) errors.push(err);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    // Check if at least one field is filled
    const hasAnyValue = weightValue || lengthValue || headCircValue;
    if (!hasAnyValue) {
      setError('Please enter at least one measurement');
      return;
    }

    // In full mode (not quick log), require all 3 fields
    if (!quickLogMode && (!weightValue || !lengthValue || !headCircValue)) {
      setError('Please enter all three measurements (or enable Quick Log for single measurement)');
      return;
    }

    if (!activeBabyProfile) {
      setError('No baby profile selected');
      return;
    }

    setIsSaving(true);

    try {
      // Create shared groupId for measurements taken together
      const groupId = Date.now();
      const dateTime = `${date}T${time}:00`;

      // Create measurement objects for all filled fields
      const measurements = [];

      if (weightValue) {
        measurements.push({
          id: groupId + 1,
          groupId,
          value: parseFloat(weightValue),
          date: dateTime,
          babyId: activeBabyProfile.id,
          type: 'weight'
        });
      }

      if (lengthValue) {
        measurements.push({
          id: groupId + 2,
          groupId,
          value: parseFloat(lengthValue),
          date: dateTime,
          babyId: activeBabyProfile.id,
          type: 'length'
        });
      }

      if (headCircValue) {
        measurements.push({
          id: groupId + 3,
          groupId,
          value: parseFloat(headCircValue),
          date: dateTime,
          babyId: activeBabyProfile.id,
          type: 'headCircumference'
        });
      }

      // Call parent save function for each measurement
      for (const measurement of measurements) {
        await onSave(measurement);
      }

      // Reset form
      setWeightValue('');
      setLengthValue('');
      setHeadCircValue('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      onClose();
    } catch (err) {
      setError('Failed to save measurements. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderMeasurementInput = (type, config) => {
    const Icon = config.icon;
    return (
      <div key={type} className="space-y-2">
        <label className={`block text-sm font-medium text-${config.color}-700 flex items-center`}>
          <Icon className={`w-4 h-4 mr-2 text-${config.color}-600`} />
          {config.label} ({config.unit})
          {!quickLogMode && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="number"
          value={config.value}
          onChange={(e) => {
            config.setValue(e.target.value);
            setError('');
          }}
          placeholder={config.placeholder}
          step={config.step}
          min={config.min}
          max={config.max}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-200 focus:border-${config.color}-500 focus:ring-${config.color}-200`}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Track Growth Measurement</h2>
              <p className="text-white text-opacity-90 text-sm">
                Track {activeBabyProfile?.name || 'baby'}'s growth
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Log Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quickLogMode}
                onChange={(e) => setQuickLogMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3 flex items-center">
                <Zap className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Quick Log Mode</span>
                <span className="ml-2 text-sm text-blue-600">(Log single measurement only)</span>
              </div>
            </label>
            <p className="mt-2 text-xs text-blue-700 ml-7">
              {quickLogMode
                ? 'You can save with just one measurement filled (useful for home weighing)'
                : 'All three measurements required (recommended for doctor visits)'}
            </p>
          </div>

          {/* All Three Measurement Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderMeasurementInput('weight', measurementConfigs.weight)}
            {renderMeasurementInput('length', measurementConfigs.length)}
            {renderMeasurementInput('headCircumference', measurementConfigs.headCircumference)}
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Measurement Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-pink-500 focus:ring-pink-200 transition-colors"
            />
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-pink-500 focus:ring-pink-200 transition-colors"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-medium text-pink-800 text-sm mb-2">
              Measurement Guidelines
            </h4>
            <ul className="text-xs text-pink-700 space-y-1">
              <li>• Weigh baby naked or in a dry diaper</li>
              <li>• Use same scale for consistency</li>
              <li>• Measure at same time of day when possible</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Measurement'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrowthMeasurementModal;
