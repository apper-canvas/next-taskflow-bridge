const taskService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "priority" } },
          { field: { Name: "category_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "completed_at" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } },
          { field: { Name: "is_recurring" } },
          { field: { Name: "recurrence_rule" } },
          { field: { Name: "recurrence_pattern" } },
          { field: { Name: "parent_task_id" } },
          { field: { Name: "is_recurrence_instance" } },
          { field: { Name: "recurrence_date" } }
        ],
        orderBy: [
          { fieldName: "created_at", sorttype: "DESC" }
        ]
      };

      const response = await apperClient.fetchRecords('task', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Map database fields to UI expected format
      const tasks = (response.data || []).map(task => ({
        Id: task.Id,
        title: task.title || task.Name,
        description: task.description || '',
        priority: task.priority || 'medium',
        categoryId: task.category_id ? task.category_id.toString() : null,
        dueDate: task.due_date,
        completed: task.completed || false,
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        isRecurring: task.is_recurring || false,
        recurrenceRule: task.recurrence_rule,
        recurrencePattern: task.recurrence_pattern,
        parentTaskId: task.parent_task_id,
        isRecurrenceInstance: task.is_recurrence_instance || false,
        recurrenceDate: task.recurrence_date
      }));

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "priority" } },
          { field: { Name: "category_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "completed_at" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } },
          { field: { Name: "is_recurring" } },
          { field: { Name: "recurrence_rule" } },
          { field: { Name: "recurrence_pattern" } },
          { field: { Name: "parent_task_id" } },
          { field: { Name: "is_recurrence_instance" } },
          { field: { Name: "recurrence_date" } }
        ]
      };

      const response = await apperClient.getRecordById('task', parseInt(id, 10), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Task not found');
      }

      // Map database fields to UI expected format
      const task = {
        Id: response.data.Id,
        title: response.data.title || response.data.Name,
        description: response.data.description || '',
        priority: response.data.priority || 'medium',
        categoryId: response.data.category_id ? response.data.category_id.toString() : null,
        dueDate: response.data.due_date,
        completed: response.data.completed || false,
        completedAt: response.data.completed_at,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        isRecurring: response.data.is_recurring || false,
        recurrenceRule: response.data.recurrence_rule,
        recurrencePattern: response.data.recurrence_pattern,
        parentTaskId: response.data.parent_task_id,
        isRecurrenceInstance: response.data.is_recurrence_instance || false,
        recurrenceDate: response.data.recurrence_date
      };

      return task;
    } catch (error) {
      console.error('Error fetching task by id:', error);
      throw error;
    }
  },

  async create(taskData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields for create operation
      const createData = {
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        category_id: taskData.categoryId ? parseInt(taskData.categoryId, 10) : null,
        due_date: taskData.dueDate || null,
        completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const params = {
        records: [createData]
      };

      const response = await apperClient.createRecord('task', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
          }
          throw new Error(result.message || 'Failed to create task');
        }

        // Map response to UI expected format
        const createdTask = {
          Id: result.data.Id,
          title: result.data.title,
          description: result.data.description || '',
          priority: result.data.priority || 'medium',
          categoryId: result.data.category_id ? result.data.category_id.toString() : null,
          dueDate: result.data.due_date,
          completed: result.data.completed || false,
          completedAt: result.data.completed_at,
          createdAt: result.data.created_at,
          updatedAt: result.data.updated_at
        };

        return createdTask;
      }

      throw new Error('No result returned from create operation');
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields for update operation
      const updateData = {
        Id: parseInt(id, 10),
        updated_at: new Date().toISOString()
      };

      // Map UI field names to database field names for updateable fields only
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId ? parseInt(updates.categoryId, 10) : null;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.completed !== undefined) {
        updateData.completed = updates.completed;
        updateData.completed_at = updates.completed ? new Date().toISOString() : null;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('task', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
          }
          throw new Error(result.message || 'Failed to update task');
        }

        // Map response to UI expected format
        const updatedTask = {
          Id: result.data.Id,
          title: result.data.title,
          description: result.data.description || '',
          priority: result.data.priority || 'medium',
          categoryId: result.data.category_id ? result.data.category_id.toString() : null,
          dueDate: result.data.due_date,
          completed: result.data.completed || false,
          completedAt: result.data.completed_at,
          createdAt: result.data.created_at,
          updatedAt: result.data.updated_at
        };

        return updatedTask;
      }

      throw new Error('No result returned from update operation');
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('task', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete task');
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async bulkUpdate(taskIds, updates) {
    try {
      const updatedTasks = [];
      
      for (const id of taskIds) {
        const updatedTask = await this.update(id, updates);
        updatedTasks.push(updatedTask);
      }
      
      return updatedTasks;
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      throw error;
    }
  },

  async bulkDelete(taskIds) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: taskIds.map(id => parseInt(id, 10))
      };

      const response = await apperClient.deleteRecord('task', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      throw error;
    }
  },

  async createRecurring(taskData, recurrenceOptions) {
    try {
      // Create the master recurring task
      const masterTaskData = {
        ...taskData,
        is_recurring: true,
        recurrence_rule: recurrenceOptions.rule,
        recurrence_pattern: recurrenceOptions.pattern,
        parent_task_id: null
      };

      const masterTask = await this.create(masterTaskData);

      // Generate task instances
      const instances = [];
      for (const date of recurrenceOptions.occurrences || []) {
        const instanceData = {
          ...taskData,
          dueDate: new Date(date).toISOString(),
          is_recurring: false,
          is_recurrence_instance: true,
          parent_task_id: masterTask.Id,
          recurrence_date: new Date(date).toISOString()
        };
        
        const instance = await this.create(instanceData);
        instances.push(instance);
      }

      return { masterTask, instances };
    } catch (error) {
      console.error('Error creating recurring task:', error);
      throw error;
    }
  },

  async getRecurringTasks() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "priority" } },
          { field: { Name: "category_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "is_recurring" } },
          { field: { Name: "recurrence_rule" } },
          { field: { Name: "recurrence_pattern" } }
        ],
        where: [
          { FieldName: "is_recurring", Operator: "EqualTo", Values: [true] }
        ]
      };

      const response = await apperClient.fetchRecords('task', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const tasks = (response.data || []).map(task => ({
        Id: task.Id,
        title: task.title || task.Name,
        description: task.description || '',
        priority: task.priority || 'medium',
        categoryId: task.category_id ? task.category_id.toString() : null,
        dueDate: task.due_date,
        completed: task.completed || false,
        isRecurring: task.is_recurring || false,
        recurrenceRule: task.recurrence_rule,
        recurrencePattern: task.recurrence_pattern
      }));

      return tasks;
    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      throw error;
    }
  },

  async getRecurrenceInstances(parentTaskId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "priority" } },
          { field: { Name: "category_id" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "parent_task_id" } },
          { field: { Name: "recurrence_date" } }
        ],
        where: [
          { FieldName: "parent_task_id", Operator: "EqualTo", Values: [parseInt(parentTaskId, 10)] }
        ]
      };

      const response = await apperClient.fetchRecords('task', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const tasks = (response.data || []).map(task => ({
        Id: task.Id,
        title: task.title || task.Name,
        description: task.description || '',
        priority: task.priority || 'medium',
        categoryId: task.category_id ? task.category_id.toString() : null,
        dueDate: task.due_date,
        completed: task.completed || false,
        parentTaskId: task.parent_task_id,
        recurrenceDate: task.recurrence_date
      }));

      return tasks;
    } catch (error) {
      console.error('Error fetching recurrence instances:', error);
      throw error;
    }
  }
};

export default taskService;