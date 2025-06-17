import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ProgressHeader from '@/components/organisms/ProgressHeader';
import TaskForm from '@/components/molecules/TaskForm';
import SearchBar from '@/components/molecules/SearchBar';
import FilterBar from '@/components/molecules/FilterBar';
import TaskList from '@/components/organisms/TaskList';
import BulkActions from '@/components/organisms/BulkActions';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { taskService, categoryService } from '@/services';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: ''
  });
  const [selectedTasks, setSelectedTasks] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.Id === updatedTask.Id ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task.Id !== taskId));
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  };

  const handleBulkTasksUpdated = (updatedTasks) => {
    if (updatedTasks.length === 0) {
      // Handle bulk delete
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.Id)));
    } else {
      // Handle bulk update
      setTasks(prev => prev.map(task => {
        const updated = updatedTasks.find(ut => ut.Id === task.Id);
        return updated || task;
      }));
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ category: '', priority: '', status: '' });
  };

  const handleTaskSelect = (taskId, selected) => {
    setSelectedTasks(prev => 
      selected 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        {/* Progress Header Skeleton */}
        <div className="animate-pulse bg-gray-200 rounded-xl h-32"></div>
        
        {/* Filter Bar Skeleton */}
        <div className="animate-pulse bg-gray-200 rounded-xl h-20"></div>
        
        {/* Task List Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <p className="text-error font-medium mb-4">{error}</p>
          <Button onClick={loadInitialData} icon="RefreshCw">
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
      {/* Progress Header */}
      <ProgressHeader tasks={tasks} />

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search tasks by title or description..."
          />
        </div>
        
        <Button
          onClick={() => setShowTaskForm(!showTaskForm)}
          icon={showTaskForm ? "X" : "Plus"}
          variant={showTaskForm ? "outline" : "primary"}
          className="sm:ml-4"
        >
          {showTaskForm ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TaskForm
            categories={categories}
            onTaskCreated={handleTaskCreated}
            onCancel={() => setShowTaskForm(false)}
          />
        </motion.div>
      )}

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        onClearFilters={handleClearFilters}
      />

      {/* Task List */}
      <TaskList
        tasks={tasks}
        categories={categories}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        searchQuery={searchQuery}
        filters={filters}
        selectedTasks={selectedTasks}
        onTaskSelect={handleTaskSelect}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedTasks={selectedTasks}
        onTasksUpdated={handleBulkTasksUpdated}
        onClearSelection={() => setSelectedTasks([])}
      />
    </motion.div>
  );
};

export default Tasks;