import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { categoryService } from '@/services';

const CategoryManager = ({ onCategoryCreated, onCategoryUpdated, onCategoryDeleted }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#5B47E0' });

  const colorOptions = [
    '#5B47E0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const updated = await categoryService.update(editingId, formData);
        setCategories(prev => prev.map(cat => cat.Id === editingId ? updated : cat));
        onCategoryUpdated?.(updated);
        toast.success('Category updated successfully');
        setEditingId(null);
      } else {
        const created = await categoryService.create(formData);
        setCategories(prev => [...prev, created]);
        onCategoryCreated?.(created);
        toast.success('Category created successfully');
        setIsCreating(false);
      }
      
      setFormData({ name: '', color: '#5B47E0' });
    } catch (error) {
      toast.error(editingId ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.Id);
    setFormData({ name: category.name, color: category.color });
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await categoryService.delete(categoryId);
      setCategories(prev => prev.filter(cat => cat.Id !== categoryId));
      onCategoryDeleted?.(categoryId);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', color: '#5B47E0' });
  };

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
        <p className="text-error font-medium mb-4">{error}</p>
        <Button onClick={loadCategories} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
        <Button
          onClick={() => setIsCreating(true)}
          icon="Plus"
          disabled={isCreating || editingId}
        >
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-surface rounded-xl p-6 border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                icon="Tag"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <motion.button
                      key={color}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`
                        w-8 h-8 rounded-full border-2 transition-all duration-200
                        ${formData.color === color ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-300'}
                      `}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  icon={editingId ? "Save" : "Plus"}
                >
                  {editingId ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="space-y-3">
        <AnimatePresence>
          {categories.map((category, index) => (
            <motion.div
              key={category.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-surface rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {category.taskCount || 0} task{(category.taskCount || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Edit3"
                    onClick={() => handleEdit(category)}
                    disabled={loading || isCreating || editingId}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash2"
                    onClick={() => handleDelete(category.Id)}
                    disabled={loading || isCreating || editingId}
                    className="text-error hover:text-error"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ApperIcon name="Tag" size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-4">Create your first category to organize your tasks</p>
            <Button onClick={() => setIsCreating(true)} icon="Plus">
              Create Category
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;