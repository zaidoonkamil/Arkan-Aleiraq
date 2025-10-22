const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./product");

const ProductVariant = sequelize.define("ProductVariant", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    color: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    size: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true,
});

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = ProductVariant;
