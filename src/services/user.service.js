const { Users } = require("../models");
const { Op } = require("sequelize");

class UserService {
    static async getAll(limit, page, search, filter) {
        const offset = (page - 1) * limit;
        const whereClause = {};
      
        if (search) {
          whereClause[Op.or] = [
            { full_name: { [Op.iLike]: `%${search}%` } },
          ];
        }
      
        if (filter) {
          Object.assign(whereClause, filter);
        }
      
        whereClause.role_id = { [Op.ne]: 1 };
      
        try {
          const { count, rows } = await Users.findAndCountAll({
            where: whereClause, 
            limit,
            offset,
            order: [["full_name", "ASC"]], 
            attributes: { exclude: ["password"] }
          });
      
          return {
            users: rows, 
            page_size: rows.length,
            total_data: count, 
            current_page: page,
            max_page: Math.ceil(count / limit),
          };
        } catch (error) {
          throw new Error(`Failed to fetch users: ${error.message}`);
        }
      }
      

    static async delete(id) {
      try {
        const user = await Users.findByPk(id);

        if (!user) {
          throw new Error('User not found');
        }

        await user.destroy();

        return user;
      } catch (error) {
        throw error;
      }
    }
}

module.exports = UserService;
