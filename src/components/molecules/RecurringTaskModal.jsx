import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek } from 'date-fns';
import { RRule, RRuleSet } from 'rrule';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const RecurringTaskModal = ({ isOpen, onClose, onConfirm, taskData }) => {
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [interval, setInterval] = useState(1);
  const [endType, setEndType] = useState('occurrences');
  const [endDate, setEndDate] = useState('');
  const [occurrenceCount, setOccurrenceCount] = useState(10);
  const [selectedDays, setSelectedDays] = useState([]);
  const [monthlyType, setMonthlyType] = useState('date');
  const [preview, setPreview] = useState([]);

  const weekDays = [
    { value: RRule.MO, label: 'Mon', short: 'M' },
    { value: RRule.TU, label: 'Tue', short: 'T' },
    { value: RRule.WE, label: 'Wed', short: 'W' },
    { value: RRule.TH, label: 'Thu', short: 'T' },
    { value: RRule.FR, label: 'Fri', short: 'F' },
    { value: RRule.SA, label: 'Sat', short: 'S' },
    { value: RRule.SU, label: 'Sun', short: 'S' }
  ];

  const recurrenceTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' }
  ];

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [isOpen, recurrenceType, interval, endType, endDate, occurrenceCount, selectedDays, monthlyType, taskData]);

  const generatePreview = () => {
    if (!taskData?.dueDate) return;

    try {
      const startDate = new Date(taskData.dueDate);
      let rule;

      const baseOptions = {
        dtstart: startDate,
        interval: interval
      };

      // Set end condition
      if (endType === 'date' && endDate) {
        baseOptions.until = new Date(endDate);
      } else if (endType === 'occurrences') {
        baseOptions.count = Math.min(occurrenceCount, 50); // Limit to 50 for performance
      }

      switch (recurrenceType) {
        case 'daily':
          rule = new RRule({
            ...baseOptions,
            freq: RRule.DAILY
          });
          break;

        case 'weekly':
          const weekdays = selectedDays.length > 0 ? selectedDays : [startDate.getDay() === 0 ? RRule.SU : startDate.getDay()];
          rule = new RRule({
            ...baseOptions,
            freq: RRule.WEEKLY,
            byweekday: weekdays
          });
          break;

        case 'monthly':
          if (monthlyType === 'date') {
            rule = new RRule({
              ...baseOptions,
              freq: RRule.MONTHLY
            });
          } else {
            // By day of week (e.g., "2nd Tuesday")
            const dayOfWeek = startDate.getDay();
            const weekOfMonth = Math.ceil(startDate.getDate() / 7);
            rule = new RRule({
              ...baseOptions,
              freq: RRule.MONTHLY,
              byweekday: dayOfWeek === 0 ? RRule.SU.nth(weekOfMonth) : (dayOfWeek - 1 + 1).nth(weekOfMonth)
            });
          }
          break;

        case 'custom':
          if (selectedDays.length > 0) {
            rule = new RRule({
              ...baseOptions,
              freq: RRule.WEEKLY,
              byweekday: selectedDays
            });
          } else {
            rule = new RRule({
              ...baseOptions,
              freq: RRule.DAILY
            });
          }
          break;

        default:
          rule = new RRule({
            ...baseOptions,
            freq: RRule.DAILY
          });
      }

      const dates = rule.all().slice(0, 20); // Show max 20 occurrences
      setPreview(dates);
    } catch (error) {
      console.error('Error generating recurrence preview:', error);
      setPreview([]);
    }
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleConfirm = () => {
    const recurrenceOptions = {
      pattern: {
        type: recurrenceType,
        interval,
        endType,
        endDate: endType === 'date' ? endDate : null,
        occurrenceCount: endType === 'occurrences' ? occurrenceCount : null,
        selectedDays: recurrenceType === 'weekly' || recurrenceType === 'custom' ? selectedDays : [],
        monthlyType: recurrenceType === 'monthly' ? monthlyType : null
      },
      rule: generateRuleString(),
      occurrences: preview
    };

    onConfirm(recurrenceOptions);
  };

  const generateRuleString = () => {
    // Generate a readable rule string for display
    let ruleText = '';
    
    switch (recurrenceType) {
      case 'daily':
        ruleText = interval === 1 ? 'Daily' : `Every ${interval} days`;
        break;
      case 'weekly':
        if (selectedDays.length === 0) {
          ruleText = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
        } else {
          const dayNames = selectedDays.map(day => weekDays.find(wd => wd.value === day)?.label).join(', ');
          ruleText = interval === 1 ? `Weekly on ${dayNames}` : `Every ${interval} weeks on ${dayNames}`;
        }
        break;
      case 'monthly':
        ruleText = interval === 1 ? 'Monthly' : `Every ${interval} months`;
        if (monthlyType === 'weekday') {
          ruleText += ' (by weekday)';
        }
        break;
      case 'custom':
        if (selectedDays.length > 0) {
          const dayNames = selectedDays.map(day => weekDays.find(wd => wd.value === day)?.label).join(', ');
          ruleText = `Custom: ${dayNames}`;
        } else {
          ruleText = 'Daily (custom)';
        }
        break;
    }

    // Add end condition
    if (endType === 'date' && endDate) {
      ruleText += ` until ${format(new Date(endDate), 'MMM dd, yyyy')}`;
    } else if (endType === 'occurrences') {
      ruleText += ` for ${occurrenceCount} occurrences`;
    }

    return ruleText;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="Repeat" size={18} className="text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Create Recurring Task</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            />
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Task Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Task: {taskData?.title}</h3>
                <p className="text-sm text-gray-600">
                  Starting: {taskData?.dueDate ? format(new Date(taskData.dueDate), 'PPP') : 'No date set'}
                </p>
              </div>

              {/* Recurrence Type */}
              <div>
                <Select
                  label="Repeat Pattern"
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  options={recurrenceTypes}
                />
              </div>

              {/* Interval */}
              <div>
                <Input
                  type="number"
                  label={`Repeat every (${recurrenceType === 'daily' ? 'days' : recurrenceType === 'weekly' ? 'weeks' : 'months'})`}
                  value={interval}
                  onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="99"
                />
              </div>

              {/* Weekly/Custom Day Selection */}
              {(recurrenceType === 'weekly' || recurrenceType === 'custom') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`w-10 h-10 rounded-full border-2 font-medium text-sm transition-colors
                          ${selectedDays.includes(day.value)
                            ? 'bg-primary border-primary text-white'
                            : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                          }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Options */}
              {recurrenceType === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Monthly Repeat Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="monthlyType"
                        value="date"
                        checked={monthlyType === 'date'}
                        onChange={(e) => setMonthlyType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">On the same date each month</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="monthlyType"
                        value="weekday"
                        checked={monthlyType === 'weekday'}
                        onChange={(e) => setMonthlyType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">On the same weekday each month</span>
                    </label>
                  </div>
                </div>
              )}

              {/* End Condition */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  End Condition
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="endType"
                      value="occurrences"
                      checked={endType === 'occurrences'}
                      onChange={(e) => setEndType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm mr-2">After</span>
                    <input
                      type="number"
                      value={occurrenceCount}
                      onChange={(e) => setOccurrenceCount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="365"
                      disabled={endType !== 'occurrences'}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm ml-1">occurrences</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="endType"
                      value="date"
                      checked={endType === 'date'}
                      onChange={(e) => setEndType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm mr-2">On</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={endType !== 'date'}
                      min={taskData?.dueDate ? taskData.dueDate.split('T')[0] : new Date().toISOString().split('T')[0]}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="endType"
                      value="never"
                      checked={endType === 'never'}
                      onChange={(e) => setEndType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Never (indefinite)</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Preview Schedule ({preview.length} occurrences shown)
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {preview.length > 0 ? (
                    <div className="space-y-2">
                      {preview.slice(0, 10).map((date, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">
                            #{index + 1}: {format(date, 'PPP')}
                          </span>
                          <span className="text-gray-500">
                            {format(date, 'EEEE')}
                          </span>
                        </div>
                      ))}
                      {preview.length > 10 && (
                        <div className="text-sm text-gray-500 text-center pt-2 border-t">
                          ...and {preview.length - 10} more occurrences
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No preview available</p>
                  )}
                </div>
              </div>

              {/* Rule Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Rule Summary</h4>
                <p className="text-sm text-blue-800">{generateRuleString()}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={preview.length === 0}
              icon="Check"
            >
              Create Recurring Task
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecurringTaskModal;