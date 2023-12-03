const bcryptjs = require("bcryptjs");
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        role_id: 1,
        full_name: 'admin',
        username: 'admin',
        email: 'admin1@gmail.com',
        password: bcryptjs.hashSync("1", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        role_id: 2,
        full_name: 'user 1',
        email: 'user1@gmail.com',
        password: bcryptjs.hashSync("1", 10),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        role_id: 2,
        full_name: 'user 2',
        email: 'user2@gmail.com',
        password: bcryptjs.hashSync("1", 10),
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
