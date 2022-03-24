const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const JWT_SALT = 'secret';

router.get('/', async (req, res, next) => {
  const { access_token } = req.headers;
  try {
    req.decoded = jwt.verify(access_token, JWT_SALT);
    const { user } = req;
    if (user) {
      const token = jwt.sign({
        id: user.userid
      }, JWT_SALT , {
        expiresIn : '1m'
      });
      return res.json({
        loginMsg : '로그인 중입니다.',
        login : true,
        token,
        user
      });
    } else {
      req.logout();
      req.session.destroy();
      return res.json({
        loginMsg : '로그아웃 되었습니다.',
        login : false,
        token : null,
        user : null
      });
    }
  }
  catch(e) {
    req.logout();
    req.session.destroy();
    return res.json({
      login : false,
      user : null,
      token : null,
      message : '유효한 토큰이 아닙니다.'
    })
  }
});
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(404).json({
        reason : '알수없는 오류가 발생하였습니다.\n 관리자에게 문의 하여 주세요.'
      });
    }
    if (info) {
      return res.status(404).json(info.reason);
    }
    return req.login(user, async (loginErr) => {
      try {
        if (loginErr) {
          return next(loginErr);
        }
        delete user.userPwd;
        const token = jwt.sign({
          id: user.userid
        }, JWT_SALT , {
          expiresIn : '1m'
        });
        return res.json({
          loginMsg : '로그인 성공',
          login:true,
          token,
          user
        })
      }
      catch(e) {
        // console.error(e);
        next(e);
      };
    });
  })(req, res, next);
});
router.post('/logout', (req, res, next) => {
  req.logout();
  req.session.destroy();
  return res.json({
    status : true,
    logoutMsg : '로그아웃 성공'
  });
});
module.exports = router;