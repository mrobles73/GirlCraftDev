module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        user_id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
        user_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        user_avatar: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        user_rank: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        user_level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        user_xp: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        weekly_xp: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        votes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        birthday: {
          type: DataTypes.INTEGER,
        },
        birthmonth: {
            type: DataTypes.INTEGER
        },
        timezone: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'America/Los_Angeles'
        },
      }, {
        timestamps: false
      });
}