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
            filter: filter || [], 
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
      

  //   static async deleteDescription(id) {
  //     try {
  //       const description = await Description.findByPk(id);

  //       if (!description) {
  //         throw new Error('Description not found');
  //       }

  //       await description.destroy();

  //       return description;
  //     } catch (error) {
  //       throw error;
  //     }
  //   }
}

module.exports = UserService;
