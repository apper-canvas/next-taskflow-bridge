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
  },

  async createRecurring(taskData, recurrenceOptions) {
    await delay(500);
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0;
    
    // Create the master recurring task
    const masterTask = {
      Id: maxId + 1,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      categoryId: taskData.categoryId || null,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRecurring: true,
      recurrenceRule: recurrenceOptions.rule,
      recurrencePattern: recurrenceOptions.pattern,
      parentTaskId: null
    };

    tasks.push(masterTask);

    // Generate initial task instances based on recurrence
    const instances = this.generateTaskInstances(masterTask, recurrenceOptions.occurrences || []);
    tasks.push(...instances);

    return { masterTask: { ...masterTask }, instances: instances.map(i => ({ ...i })) };
  },

  generateTaskInstances(masterTask, occurrences) {
    const instances = [];
    let currentId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) + 1 : masterTask.Id + 1;

    occurrences.forEach(date => {
      const instance = {
        Id: currentId++,
        title: masterTask.title,
        description: masterTask.description,
        priority: masterTask.priority,
        categoryId: masterTask.categoryId,
        dueDate: new Date(date).toISOString(),
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRecurring: false,
        isRecurrenceInstance: true,
        parentTaskId: masterTask.Id,
        recurrenceDate: new Date(date).toISOString()
      };
      instances.push(instance);
    });

    return instances;
  },

  async getRecurringTasks() {
    await delay(200);
    return tasks.filter(task => task.isRecurring).map(task => ({ ...task }));
  },

  async getRecurrenceInstances(parentTaskId) {
    await delay(200);
    return tasks.filter(task => task.parentTaskId === parseInt(parentTaskId, 10)).map(task => ({ ...task }));
  }
};

export default taskService;