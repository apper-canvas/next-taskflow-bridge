const categoryService = {
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
          { field: { Name: "color" } },
          { field: { Name: "task_count" } },
          { field: { Name: "created_at" } }
        ],
        aggregators: [
          {
            id: 'taskCounts',
            table: { Name: 'task' },
            fields: [
              { field: { Name: "Id" }, Function: 'Count', Alias: 'Count' }
            ],
            groupBy: ["category_id"]
          }
        ],
        orderBy: [
          { fieldName: "created_at", sorttype: "ASC" }
        ]
      };

      const response = await apperClient.fetchRecords('category', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Map database fields to UI expected format
      const categories = (response.data || []).map(category => ({
        Id: category.Id,
        name: category.Name,
        color: category.color || '#5B47E0',
        taskCount: category.task_count || 0,
        createdAt: category.created_at
      }));

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
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
          { field: { Name: "color" } },
          { field: { Name: "task_count" } },
          { field: { Name: "created_at" } }
        ]
      };

      const response = await apperClient.getRecordById('category', parseInt(id, 10), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Category not found');
      }

      // Map database fields to UI expected format
      const category = {
        Id: response.data.Id,
        name: response.data.Name,
        color: response.data.color || '#5B47E0',
        taskCount: response.data.task_count || 0,
        createdAt: response.data.created_at
      };

      return category;
    } catch (error) {
      console.error('Error fetching category by id:', error);
      throw error;
    }
  },

  async create(categoryData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include Updateable fields for create operation
      const createData = {
        Name: categoryData.name,
        color: categoryData.color || '#5B47E0',
        task_count: 0,
        created_at: new Date().toISOString()
      };

      const params = {
        records: [createData]
      };

      const response = await apperClient.createRecord('category', params);

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
          throw new Error(result.message || 'Failed to create category');
        }

        // Map response to UI expected format
        const createdCategory = {
          Id: result.data.Id,
          name: result.data.Name,
          color: result.data.color || '#5B47E0',
          taskCount: result.data.task_count || 0,
          createdAt: result.data.created_at
        };

        return createdCategory;
      }

      throw new Error('No result returned from create operation');
    } catch (error) {
      console.error('Error creating category:', error);
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
        Id: parseInt(id, 10)
      };

      // Map UI field names to database field names for updateable fields only
      if (updates.name !== undefined) updateData.Name = updates.name;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.taskCount !== undefined) updateData.task_count = updates.taskCount;

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('category', params);

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
          throw new Error(result.message || 'Failed to update category');
        }

        // Map response to UI expected format
        const updatedCategory = {
          Id: result.data.Id,
          name: result.data.Name,
          color: result.data.color || '#5B47E0',
          taskCount: result.data.task_count || 0,
          createdAt: result.data.created_at
        };

        return updatedCategory;
      }

      throw new Error('No result returned from update operation');
    } catch (error) {
      console.error('Error updating category:', error);
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

      const response = await apperClient.deleteRecord('category', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          throw new Error(result.message || 'Failed to delete category');
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

export default categoryService;