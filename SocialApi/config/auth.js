const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = function(passport){

    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
        User.findOne({email: email}).then((user)=>{
            if(!user){
                return done(null, false, {message: 'User not found'});
            }
            bcrypt.compare(password, user.password,(err, batem)=>{
                if (batem) {
                    return done(null, user);
                  } else {
                    return done(null, false, { message: "senha incorreta" });
                  }
            })
        })
    }))
    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });
}