module.exports = (sequelize, DataTypes) => {
    return sequelize.define('votes', {
        user_id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        votes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      }, {
        timestamps: false
      });
}