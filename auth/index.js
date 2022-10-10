const LocalStrategy = require("passport-local").Strategy;
const db = require('../models');
const Users = db.users;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');


function initialize(passport) {
    const autheticateUser = (username, password, done) => {
        Users.findOne({
            where: {username: username}
        })
        .then(result => {
            console.log(result);
            if (result) {
                const user = result;

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.log(err);
                    }
                    if (isMatch) {
                        return done(null, user, {

                            message: `Berhasil Login Selemat Datang ${user.username}`
                        });
                    } else {
                        
                        return done(null, false, {
                            message: "Username and password is incorrect"
                        });
                    }
                });
            } else {
                // tidak ada user
                return done(null, false, {
                    message: "Username and password is incorrect"
                });
            }
        })
        .catch(err => {
            throw err;
        });
    }

    passport.use(
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
            },
            autheticateUser
        )
    );

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id_user, done) => {
        Users.findOne({
            where : {id: id_user}
        })
        .then(result => {
            return done(null, result);
        })
        .catch(err => {
            return done(err);
        })
    });
}

module.exports = initialize;