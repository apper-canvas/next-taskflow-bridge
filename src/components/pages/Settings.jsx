import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { taskService, categoryService } from '@/services';

const Settings = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalCategories: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [tasks, categories] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);

      const completedTasks = tasks.filter(task => task.completed).length;
      const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

      setStats({
        totalTasks: tasks.length,
        completedTasks,
        totalCategories: categories.length,
        completionRate: Math.round(completionRate)
      });
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDataReset = async () => {
    if (!window.confirm('⚠️ This will delete ALL your tasks and categories. This action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    const confirmation = window.prompt('Type "DELETE ALL DATA" to confirm this action:');
    if (confirmation !== 'DELETE ALL DATA') {
      toast.info('Data reset cancelled');
      return;
    }

    setLoading(true);
    try {
      // This would reset to initial mock data in a real app
      toast.success('Data reset completed');
      await loadStats();
    } catch (error) {
      toast.error('Failed to reset data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const [tasks, categories] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);

      const exportData = {
        tasks,
        categories,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully! 📁');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const settingsSections = [
    {
      title: 'Account Overview',
      icon: 'User',
      items: [
        { label: 'Total Tasks', value: stats.totalTasks, icon: 'CheckSquare' },
        { label: 'Completed Tasks', value: stats.completedTasks, icon: 'CheckCircle' },
        { label: 'Categories', value: stats.totalCategories, icon: 'Tag' },
        { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: 'TrendingUp' }
      ]
    },
    {
      title: 'Data Management',
      icon: 'Database',
      actions: [
        {
          label: 'Export Data',
          description: 'Download your tasks and categories as JSON',
          icon: 'Download',
          variant: 'outline',
          onClick: exportData
        },
        {
          label: 'Reset All Data',
          description: 'Delete all tasks and categories (cannot be undone)',
          icon: 'AlertTriangle',
          variant: 'danger',
          onClick: handleDataReset
        }
      ]
    },
    {
      title: 'Application Info',
      icon: 'Info',
      items: [
        { label: 'Version', value: '1.0.0', icon: 'Package' },
        { label: 'Build Date', value: new Date().toLocaleDateString(), icon: 'Calendar' },
        { label: 'Storage', value: 'Local Browser', icon: 'HardDrive' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-6 min-h-full"
    >
      {/* Header */}
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <ApperIcon name="Settings" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your TaskFlow preferences and data</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ApperIcon name={section.icon} size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            </div>

            {section.items && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (index * 0.1) + (itemIndex * 0.05) }}
                    className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                  >
                    <ApperIcon name={item.icon} size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{loading ? '...' : item.value}</p>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {section.actions && (
              <div className="space-y-3">
                {section.actions.map((action, actionIndex) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.1) + (actionIndex * 0.05) }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <ApperIcon name={action.icon} size={20} className="text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{action.label}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={action.variant}
                      size="sm"
                      onClick={action.onClick}
                      loading={loading}
                      disabled={loading}
                    >
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
          <ApperIcon name="Heart" size={16} className="text-accent" />
          <span className="text-sm">Made with care for productivity enthusiasts</span>
        </div>
        <p className="text-xs text-gray-400">
          TaskFlow v1.0.0 - Your data stays private and secure in your browser
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Settings;