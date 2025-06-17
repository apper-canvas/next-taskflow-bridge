import taskData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tasks = [...taskData];

const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id, 10));
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0;
    const newTask = {
      Id: maxId + 1,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      categoryId: taskData.categoryId || null,
      dueDate: taskData.dueDate || null,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updates) {
    await delay(300);
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      Id: tasks[taskIndex].Id, // Prevent ID modification
      updatedAt: new Date().toISOString()
    };

    // Handle completion logic
    if (updates.completed !== undefined) {
      updatedTask.completedAt = updates.completed ? new Date().toISOString() : null;
    }

    tasks[taskIndex] = updatedTask;
    return { ...updatedTask };
  },

  async delete(id) {
    await delay(250);
    const taskIndex = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    tasks.splice(taskIndex, 1);
    return true;
  },

  async bulkUpdate(taskIds, updates) {
    await delay(400);
    const updatedTasks = [];
    
    for (const id of taskIds) {
      const taskIndex = tasks.findIndex(t => t.Id === parseInt(id, 10));
      if (taskIndex !== -1) {
        const updatedTask = {
          ...tasks[taskIndex],
          ...updates,
          Id: tasks[taskIndex].Id,
          updatedAt: new Date().toISOString()
        };
        
        if (updates.completed !== undefined) {
          updatedTask.completedAt = updates.completed ? new Date().toISOString() : null;
        }
        
        tasks[taskIndex] = updatedTask;
        updatedTasks.push({ ...updatedTask });
      }
    }
    
    return updatedTasks;
  },

  async bulkDelete(taskIds) {
    await delay(350);
    const idsToDelete = taskIds.map(id => parseInt(id, 10));
    tasks = tasks.filter(task => !idsToDelete.includes(task.Id));
    return true;
  }
};

export default taskService;