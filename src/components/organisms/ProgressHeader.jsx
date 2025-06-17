import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { isToday, isPast } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const ProgressHeader = ({ tasks = [] }) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    completionRate: 0
  });

  useEffect(() => {
    const today = new Date().toDateString();
    
    const todayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toDateString() === today;
    });

    const overdueTasks = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return isPast(new Date(task.dueDate));
    });

    const completedToday = todayTasks.filter(task => task.completed).length;
    const completionRate = todayTasks.length > 0 ? (completedToday / todayTasks.length) * 100 : 0;

    setStats({
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      overdue: overdueTasks.length,
      dueToday: todayTasks.length,
      completionRate: Math.round(completionRate)
    });
  }, [tasks]);

  const progressBarWidth = stats.dueToday > 0 ? (stats.completionRate) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Progress Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Today's Progress</h2>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">{stats.completionRate}%</span>
              {stats.completionRate === 100 && stats.dueToday > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <ApperIcon name="PartyPopper" size={24} className="text-accent" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-3 mb-4">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressBarWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            {/* Celebration confetti effect */}
            {stats.completionRate === 100 && stats.dueToday > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-accent rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      y: [-20, -40, -60]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600">
            {stats.dueToday > 0 
              ? `${stats.dueToday - (stats.dueToday * stats.completionRate / 100)} of ${stats.dueToday} tasks remaining today`
              : 'No tasks due today'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:ml-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ApperIcon name="CheckSquare" size={16} className="text-gray-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-xs text-gray-500">Total Tasks</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ApperIcon name="CheckCircle" size={16} className="text-success" />
              <span className="text-2xl font-bold text-success">{stats.completed}</span>
            </div>
            <p className="text-xs text-gray-500">Completed</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ApperIcon name="Calendar" size={16} className="text-warning" />
              <span className="text-2xl font-bold text-warning">{stats.dueToday}</span>
            </div>
            <p className="text-xs text-gray-500">Due Today</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ApperIcon name="AlertTriangle" size={16} className="text-error" />
              <span className="text-2xl font-bold text-error">{stats.overdue}</span>
            </div>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
        </div>
      </div>

      {/* Achievement Message */}
      {stats.completionRate === 100 && stats.dueToday > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20"
        >
          <div className="flex items-center space-x-2">
            <ApperIcon name="Trophy" size={20} className="text-accent" />
            <p className="text-sm font-medium text-gray-900">
              🎉 Fantastic! You've completed all your tasks for today!
            </p>
          </div>
        </motion.div>
      )}

      {/* Motivation Message */}
      {stats.overdue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-error/5 rounded-lg border border-error/20"
        >
          <div className="flex items-center space-x-2">
            <ApperIcon name="AlertCircle" size={20} className="text-error" />
            <p className="text-sm font-medium text-gray-900">
              You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}. Consider rescheduling or completing them today.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressHeader;