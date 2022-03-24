const passport = require('passport');
const local = require('./local');

module.exports = (app) => {
  // 서버쪽에 배열로 저장 cookie는 프런트로 보내줌 (서버 메모리 최소화)
  passport.serializeUser((user, done) => {
    return done(null, user);
  });
  // 프론트에 저장한 쿠키값으로 서버쪽으로 요청시 연결된 id값을 찾아서 db에 조회
  passport.deserializeUser(async(user, done) => {
    // console.log(id)
    return done(null, user); // req.user에 저장
  });
  local(app);
};



// 프론트 -> 서버 : 쿠키만 전송
// 서버가 cookie-parser, express-session 으로 쿠키검사 후 해당 id 검색
// 검색된 id로 deserializeUser에 들어가고
// 해당 유저 정보를 req.user로 저장

// 프런트에서 요청 보낼때마다 deserializeUser 실행 (요청마다 db조회)
// deserializeUser 결과물 캐싱하는 경우가 많음