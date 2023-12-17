const { Description } = require('../models');

class DescriptionService {
  static async getAllDescriptions() {
    try {
      const descriptions = await Description.findAll();
      return descriptions;
    } catch (error) {
      throw error;
    }
  }

  static async getDescriptionById(id) {
    try {
      const description = await Description.findByPk(id);
      return description;
    } catch (error) {
      throw error;
    }
  }

  static async createDescription(data) {
    try {
      const description = await Description.create(data);
      return description;
    } catch (error) {
      throw error;
    }
  }

  static async updateDescription(id, updatedData) {
    try {
      const description = await Description.findByPk(id);
      
      if (!description) {
        throw new Error('Description not found');
      }

      await description.update(updatedData);

      return description;
    } catch (error) {
      throw error;
    }
  }

  static async deleteDescription(id) {
    try {
      const description = await Description.findByPk(id);

      if (!description) {
        throw new Error('Description not found');
      }

      await description.destroy();

      return description;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DescriptionService;
