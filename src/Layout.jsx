import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';
import { taskService } from '@/services';

const Layout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    const loadTodayStats = async () => {
      try {
        const tasks = await taskService.getAll();
        const today = new Date().toDateString();
        const todayTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          return new Date(task.dueDate).toDateString() === today;
        });
        
        setTodayStats({
          completed: todayTasks.filter(task => task.completed).length,
          total: todayTasks.length
        });
      } catch (error) {
        console.error('Failed to load today stats:', error);
      }
    };

    loadTodayStats();
  }, [location]);

  const completionPercentage = todayStats.total > 0 ? (todayStats.completed / todayStats.total) * 100 : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-surface border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckSquare" size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 font-heading">TaskFlow</h1>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <span>Today: {todayStats.completed}/{todayStats.total}</span>
            </div>
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#5B47E0"
                  strokeWidth="2"
                  strokeDasharray={`${completionPercentage} 100`}
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${completionPercentage} 100` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-700">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={`
          w-64 bg-surface border-r border-gray-200 z-50 lg:z-40
          ${mobileMenuOpen ? 'fixed inset-y-0 left-0' : 'hidden lg:block'}
          lg:static lg:translate-x-0
        `}>
          <AnimatePresence>
            {(mobileMenuOpen || window.innerWidth >= 1024) && (
              <motion.nav
                initial={{ x: -264 }}
                animate={{ x: 0 }}
                exit={{ x: -264 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="h-full overflow-y-auto p-4 lg:p-6"
              >
                <div className="space-y-2">
                  {routeArray.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-white shadow-lg transform scale-105' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-102'
                        }
                      `}
                    >
                      <ApperIcon 
                        name={route.icon} 
                        size={18} 
                        className={location.pathname === route.path ? 'text-white' : 'text-gray-500'} 
                      />
                      <span>{route.label}</span>
                    </NavLink>
                  ))}
                </div>

                {/* Category Quick Access */}
                <div className="mt-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Filters
                  </h3>
                  <div className="space-y-1">
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 w-full text-left transition-colors">
                      <div className="w-3 h-3 bg-error rounded-full"></div>
                      <span>High Priority</span>
                    </button>
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 w-full text-left transition-colors">
                      <ApperIcon name="Clock" size={14} className="text-warning" />
                      <span>Due Today</span>
                    </button>
                    <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 w-full text-left transition-colors">
                      <ApperIcon name="AlertTriangle" size={14} className="text-error" />
                      <span>Overdue</span>
                    </button>
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;