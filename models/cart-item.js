const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const CartItem = sequelize.define('cartItem', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    }
});

module.exports = CartItem;