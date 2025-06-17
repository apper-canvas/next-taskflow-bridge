import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import RecurringTaskModal from '@/components/molecules/RecurringTaskModal';
import { taskService } from '@/services';
const TaskForm = ({ categories = [], onTaskCreated, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    categoryId: '',
    dueDate: ''
});
  const [errors, setErrors] = useState({});
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        categoryId: formData.categoryId || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      const newTask = await taskService.create(taskData);
      onTaskCreated(newTask);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        categoryId: '',
        dueDate: ''
      });
      
      toast.success('Task created successfully! 🎉');
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Create task error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
}
  };

  const handleRecurringTaskCreate = async (recurrenceOptions) => {
    setIsCreatingRecurring(true);
    setShowRecurringModal(false);

    try {
const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        categoryId: formData.categoryId || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      const result = await taskService.createRecurring(taskData, recurrenceOptions);
      
      // Notify parent of all created tasks (master + instances)
      onTaskCreated(result.masterTask);
      result.instances.forEach(instance => onTaskCreated(instance));
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        categoryId: '',
        dueDate: ''
      });
      
      toast.success(`Recurring task created! Generated ${result.instances.length} task instances. 🔄`);
    } catch (error) {
      toast.error('Failed to create recurring task');
      console.error('Create recurring task error:', error);
    } finally {
      setIsCreatingRecurring(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }

  const categoryOptions = categories.map(cat => ({
    value: cat.Id.toString(),
    label: cat.name
  }));

  // Set due date to today as default
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl p-6 shadow-lg border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <ApperIcon name="Plus" size={18} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Add New Task</h2>
        </div>
        
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            icon="X"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="What needs to be done?"
          error={errors.title}
          icon="Edit3"
        />

        <Textarea
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Add more details about this task..."
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            options={priorityOptions}
          />

          <Select
            label="Category (Optional)"
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
          />
        </div>

        <Input
          type="date"
          label="Due Date (Optional)"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          min={today}
          icon="Calendar"
        />

<div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="outline"
            icon="Repeat"
            onClick={() => setShowRecurringModal(true)}
            disabled={loading || isCreatingRecurring || !formData.title.trim()}
            className="text-sm"
          >
            Make Recurring
          </Button>

          <div className="flex space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading || isCreatingRecurring}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              loading={loading || isCreatingRecurring}
              icon="Plus"
              className="min-w-[120px]"
            >
              {loading || isCreatingRecurring ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>

      {/* Recurring Task Modal */}
      <RecurringTaskModal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        onConfirm={handleRecurringTaskCreate}
        taskData={formData}
      />
    </motion.div>
  );
};

export default TaskForm;