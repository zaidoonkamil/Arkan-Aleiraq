const User = require("./user");
const UserDevice = require("./user_device");
const NotificationLog = require("./notification_log");
const Product = require("./product");
const ProductVariant = require("./ProductVariant");
const UserHiddenVariant = require("./UserHiddenVariants");



User.hasMany(UserDevice, { foreignKey: 'user_id', as: 'devices', onDelete: 'CASCADE' });
UserDevice.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });


User.belongsToMany(ProductVariant, { through: UserHiddenVariant, foreignKey: "user_id", as: "hiddenVariants",});
ProductVariant.belongsToMany(User, { through: UserHiddenVariant, foreignKey: "variant_id", as: "hiddenByUsers",});

module.exports = {
  User,
  UserDevice,
  NotificationLog,
  Product,
  ProductVariant,
  UserHiddenVariant,
};
