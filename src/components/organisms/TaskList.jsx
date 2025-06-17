import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, isPast, startOfDay } from 'date-fns';
import TaskItem from '@/components/molecules/TaskItem';
import ApperIcon from '@/components/ApperIcon';

const TaskList = ({ 
  tasks = [], 
  categories = [], 
  onTaskUpdate, 
  onTaskDelete,
  searchQuery = '',
  filters = {},
  selectedTasks = [],
  onTaskSelect 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    overdue: true,
    today: true,
    upcoming: true,
    completed: false
  });

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query) && 
            !task.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

// Category filter
      if (filters.category && task.categoryId !== filters.category) {
        return false;
      }

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Status filter
      if (filters.status) {
        if (filters.status === 'completed' && !task.completed) return false;
        if (filters.status === 'pending' && task.completed) return false;
        if (filters.status === 'overdue') {
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          if (!dueDate || !isPast(dueDate) || task.completed) return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, filters]);

  // Group tasks by status and date
  const groupedTasks = useMemo(() => {
    const groups = {
      overdue: [],
      today: [],
      upcoming: [],
      completed: []
    };

    filteredTasks.forEach(task => {
      if (task.completed) {
        groups.completed.push(task);
        return;
      }

      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      
      if (dueDate) {
        if (isPast(startOfDay(dueDate)) && !task.completed) {
          groups.overdue.push(task);
        } else if (isToday(dueDate)) {
          groups.today.push(task);
        } else {
          groups.upcoming.push(task);
        }
      } else {
        groups.upcoming.push(task);
      }
    });

    // Sort each group
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        // Sort by priority (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        
        // Finally by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    return groups;
  }, [filteredTasks]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSectionIcon = (section) => {
    const icons = {
      overdue: 'AlertTriangle',
      today: 'Calendar',
      upcoming: 'Clock',
      completed: 'CheckCircle'
    };
    return icons[section];
  };

  const getSectionColor = (section) => {
    const colors = {
      overdue: 'text-error',
      today: 'text-warning',
      upcoming: 'text-info',
      completed: 'text-success'
    };
    return colors[section];
  };

  const renderTaskSection = (sectionKey, sectionTitle, tasks) => {
    if (tasks.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <motion.div
        key={sectionKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-xl border border-gray-200 overflow-hidden"
      >
        <motion.button
          onClick={() => toggleSection(sectionKey)}
          whileHover={{ backgroundColor: '#f9fafb' }}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ApperIcon 
              name={getSectionIcon(sectionKey)} 
              size={20} 
              className={getSectionColor(sectionKey)} 
            />
            <h3 className="font-semibold text-gray-900">{sectionTitle}</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {tasks.length}
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ApperIcon name="ChevronDown" size={20} className="text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border-t border-gray-200"
            >
              <div className="p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskItem
                        task={task}
                        categories={categories}
                        onUpdate={onTaskUpdate}
                        onDelete={onTaskDelete}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (filteredTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <ApperIcon name="CheckSquare" size={48} className="text-gray-300 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery || Object.keys(filters).some(key => filters[key]) 
            ? 'No tasks match your filters' 
            : 'No tasks yet'
          }
        </h3>
        <p className="text-gray-500">
          {searchQuery || Object.keys(filters).some(key => filters[key])
            ? 'Try adjusting your search or filters'
            : 'Create your first task to get started with TaskFlow'
          }
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {renderTaskSection('overdue', 'Overdue', groupedTasks.overdue)}
      {renderTaskSection('today', 'Due Today', groupedTasks.today)}
      {renderTaskSection('upcoming', 'Upcoming', groupedTasks.upcoming)}
      {renderTaskSection('completed', 'Completed', groupedTasks.completed)}
    </div>
  );
};

export default TaskList;