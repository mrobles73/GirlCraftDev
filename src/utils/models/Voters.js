module.exports = (sequelize, DataTypes) => {
    return sequelize.define('voters', {
        user_id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
        votes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        first_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        second_id: {
            type: DataTypes.STRING,
            allowNull: true,
        }
      }, {
        timestamps: false
      });
}