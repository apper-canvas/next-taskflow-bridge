import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  categories = [],
  onClearFilters 
}) => {
  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat.Id.toString(),
    label: cat.name
  }));

  const hasActiveFilters = filters.category || filters.priority || filters.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl p-4 shadow-sm border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Filter" size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Select
              value={filters.category || ''}
              onChange={(e) => onFilterChange('category', e.target.value)}
              options={categoryOptions}
              placeholder="All Categories"
              className="min-w-0 sm:w-40"
            />
            
            <Select
              value={filters.priority || ''}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              options={priorityOptions}
              placeholder="All Priorities"
              className="min-w-0 sm:w-40"
            />
            
            <Select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
              options={statusOptions}
              placeholder="All Status"
              className="min-w-0 sm:w-36"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="X" size={16} />
            <span>Clear Filters</span>
          </motion.button>
        )}
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200"
        >
          {filters.category && (
            <Badge variant="primary" className="flex items-center space-x-1">
              <span>Category: {categories.find(c => c.Id.toString() === filters.category)?.name}</span>
              <button
                onClick={() => onFilterChange('category', '')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <ApperIcon name="X" size={12} />
              </button>
            </Badge>
          )}
          
          {filters.priority && (
            <Badge variant={filters.priority} className="flex items-center space-x-1">
              <span>Priority: {filters.priority}</span>
              <button
                onClick={() => onFilterChange('priority', '')}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <ApperIcon name="X" size={12} />
              </button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="default" className="flex items-center space-x-1">
              <span>Status: {filters.status}</span>
              <button
                onClick={() => onFilterChange('status', '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <ApperIcon name="X" size={12} />
              </button>
            </Badge>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default FilterBar;