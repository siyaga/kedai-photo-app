module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        nama: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING
        },
        image : {
            type: Sequelize.STRING
        }
        
    });

    return User;
};