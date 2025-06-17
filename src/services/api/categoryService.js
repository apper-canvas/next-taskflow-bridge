import categoryData from '../mockData/categories.json';
import { taskService } from '../index.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let categories = [...categoryData];

const categoryService = {
  async getAll() {
    await delay(250);
    // Update task counts
    try {
      const tasks = await taskService.getAll();
      const categoriesWithCounts = categories.map(category => ({
        ...category,
        taskCount: tasks.filter(task => task.categoryId === category.Id.toString()).length
      }));
      return [...categoriesWithCounts];
    } catch (error) {
      return [...categories];
    }
  },

  async getById(id) {
    await delay(200);
    const category = categories.find(c => c.Id === parseInt(id, 10));
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category };
  },

  async create(categoryData) {
    await delay(300);
    const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.Id)) : 0;
    const newCategory = {
      Id: maxId + 1,
      name: categoryData.name,
      color: categoryData.color || '#5B47E0',
      taskCount: 0,
      createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, updates) {
    await delay(250);
    const categoryIndex = categories.findIndex(c => c.Id === parseInt(id, 10));
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = {
      ...categories[categoryIndex],
      ...updates,
      Id: categories[categoryIndex].Id // Prevent ID modification
    };
    
    categories[categoryIndex] = updatedCategory;
    return { ...updatedCategory };
  },

  async delete(id) {
    await delay(300);
    const categoryIndex = categories.findIndex(c => c.Id === parseInt(id, 10));
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    categories.splice(categoryIndex, 1);
    return true;
  }
};

export default categoryService;