import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import CategoryManager from '@/components/organisms/CategoryManager';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { categoryService, taskService } from '@/services';

const Categories = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Just trigger a reload - CategoryManager handles its own data
      await categoryService.getAll();
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <p className="text-error font-medium mb-4">{error}</p>
          <Button onClick={loadData} icon="RefreshCw">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-6 min-h-full"
    >
      {/* Header */}
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <ApperIcon name="Tag" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Organize your tasks with custom categories and colors</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <ApperIcon name="Palette" size={16} className="text-accent" />
            <span className="text-sm text-gray-600">Custom colors for easy identification</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <ApperIcon name="BarChart3" size={16} className="text-success" />
            <span className="text-sm text-gray-600">Track tasks per category</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <ApperIcon name="Filter" size={16} className="text-info" />
            <span className="text-sm text-gray-600">Filter tasks by category</span>
          </div>
        </div>
      </div>

      {/* Category Manager */}
      <CategoryManager
        onCategoryCreated={(category) => {
          toast.success(`Category "${category.name}" created successfully! 🎉`);
        }}
        onCategoryUpdated={(category) => {
          toast.success(`Category "${category.name}" updated successfully`);
        }}
        onCategoryDeleted={(categoryId) => {
          toast.success('Category deleted successfully');
        }}
      />
    </motion.div>
  );
};

export default Categories;