const crypto = require('crypto')

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.belongsToMany(models.user, {
        as: "friend",
        through: "follow"
      }),

        user.belongsToMany(models.todo, {
          through: 'todo_user'
        })
    }
  };
  
  user.init({
    email: DataTypes.STRING,
    nickname: DataTypes.STRING,
    full_name: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });

  user.addHook('afterValidate', (data, options) => {
    if (data.password) {
      data.password = crypto.createHmac('sha256', '4bproject')
        .update(data.password)
        .digest("base64")
    }
  })

  /* select 쿼리를 날릴 때, where 조건문에 있는 password를 자동으로 hash해주는 hooks를 추가했습니다. */
  user.addHook('beforeFind', (data, options) => {
    console.log(data.where)
    if (data.where.password) {
      data.where.password = crypto.createHmac('sha256', '4bproject')
        .update(data.where.password)
        .digest("base64")
    }
  })

  return user;
};