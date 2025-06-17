import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { taskService } from '@/services';

const BulkActions = ({ 
  selectedTasks = [], 
  onTasksUpdated, 
  onClearSelection 
}) => {
  const [loading, setLoading] = useState(false);

  if (selectedTasks.length === 0) return null;

  const handleBulkComplete = async () => {
    setLoading(true);
    try {
      const updatedTasks = await taskService.bulkUpdate(selectedTasks, { completed: true });
      onTasksUpdated(updatedTasks);
      onClearSelection();
      toast.success(`${selectedTasks.length} tasks marked as completed! 🎉`);
    } catch (error) {
      toast.error('Failed to update tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.length} selected tasks? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await taskService.bulkDelete(selectedTasks);
      onTasksUpdated([]);
      onClearSelection();
      toast.success(`${selectedTasks.length} tasks deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-surface rounded-xl shadow-2xl border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">{selectedTasks.length}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon="Check"
                onClick={handleBulkComplete}
                loading={loading}
                disabled={loading}
              >
                Complete
              </Button>

              <Button
                variant="danger"
                size="sm"
                icon="Trash2"
                onClick={handleBulkDelete}
                loading={loading}
                disabled={loading}
              >
                Delete
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={onClearSelection}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActions;