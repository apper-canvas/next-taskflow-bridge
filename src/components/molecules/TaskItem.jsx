import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isToday, isPast } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { taskService, categoryService } from '@/services';

const TaskItem = ({ task, categories = [], onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium'
  });

  const category = categories.find(cat => cat.Id.toString() === task.categoryId);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !task.completed;
  const isDueToday = dueDate && isToday(dueDate);

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const updatedTask = await taskService.update(task.Id, {
        completed: !task.completed
      });
      onUpdate(updatedTask);
      
      if (updatedTask.completed) {
        toast.success('Task completed! 🎉');
      } else {
        toast.info('Task marked as incomplete');
      }
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!editData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    try {
      const updatedTask = await taskService.update(task.Id, editData);
      onUpdate(updatedTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setLoading(true);
    try {
      await taskService.delete(task.Id);
      onDelete(task.Id);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    high: 'error',
    medium: 'warning', 
    low: 'success'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01 }}
      className={`
        bg-surface rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-200
        ${task.completed ? 'opacity-75' : ''}
        ${isOverdue ? 'border-l-4 border-l-error' : ''}
        ${isDueToday ? 'border-l-4 border-l-warning' : ''}
        hover:shadow-md
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleComplete}
          disabled={loading}
          className="flex-shrink-0 mt-1"
        >
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
            ${task.completed 
              ? 'bg-primary border-primary' 
              : 'border-gray-300 hover:border-primary'
            }
          `}>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <ApperIcon name="Check" size={12} className="text-white" />
              </motion.div>
            )}
          </div>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Task title"
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none"
                rows={2}
                placeholder="Task description"
              />
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <h3 className={`
                  font-medium text-gray-900 break-words
                  ${task.completed ? 'line-through text-gray-500' : ''}
                `}>
                  {task.title}
                </h3>
                
                <div className="flex items-center space-x-1 ml-2">
                  <Badge 
                    variant={priorityColors[task.priority]} 
                    size="sm"
                    className={task.priority === 'high' ? 'animate-pulse-gentle' : ''}
                  >
                    {task.priority}
                  </Badge>
                  
                  {category && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                      title={category.name}
                    />
                  )}
                </div>
              </div>

              {task.description && (
                <p className={`
                  mt-1 text-sm text-gray-600 break-words
                  ${task.completed ? 'line-through' : ''}
                `}>
                  {task.description}
                </p>
              )}

              {/* Due Date & Status */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-3 text-sm">
                  {dueDate && (
                    <div className={`
                      flex items-center space-x-1
                      ${isOverdue ? 'text-error' : isDueToday ? 'text-warning' : 'text-gray-500'}
                    `}>
                      <ApperIcon name="Calendar" size={14} />
                      <span>
                        {isToday(dueDate) ? 'Today' : format(dueDate, 'MMM d')}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  )}
                  
                  {category && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <ApperIcon name="Tag" size={14} />
                      <span>{category.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEdit}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name={isEditing ? "Check" : "Edit3"} size={16} />
          </motion.button>
          
          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="X" size={16} />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-error rounded-lg hover:bg-red-50 transition-colors"
          >
            <ApperIcon name="Trash2" size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;