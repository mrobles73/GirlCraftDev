module.exports = (sequelize, DataTypes) => {
    return sequelize.define('xpwinner', {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        user_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        weekly_xp: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      }, {
        timestamps: false
      });
}