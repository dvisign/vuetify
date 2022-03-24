const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = (app) => {
  passport.use(new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'userPw',
  }, (userId, userPw, done) => {
    if (userId === 'manager' && userPw === '1234') {
      const auth = 103;
      return done(null, {
        userId,
        auth
      }); 
    }
    if (userId === 'admin1' && userPw === '1234') {
      const auth = 100;
      return done(null, {
        userId,
        auth
      }); 
    }
    if (userId === 'admin2' && userPw === '1234') {
      const auth = 101;
      return done(null, {
        userId,
        auth
      }); 
    }
    if (userId === 'admin3' && userPw === '1234') {
      const auth = 102;
      return done(null, {
        userId,
        auth
      }); 
    }
    if (userId === 'user1' && userPw === '1234') {
      const auth = 0;
      return done(null, {
        userId,
        auth
      }); 
    }
    if (userId === 'user2' && userPw === '1234') {
      const auth = 1;
      return done(null, {
        userId,
        auth
      }); 
    }
    return done(null, false, { reason: '아이디 혹은 비밀번호가 틀립니다.' }); 
  }));
};