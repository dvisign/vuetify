const express = require("express");
const cookieParser = require('cookie-parser');
const session = require('express-session'); 
const cors = require('cors');

const port = process.env.PORT || 5000;

const apiRoute = require('./router');

// express 객체 생성
const app = express();

const passport = require('passport');
const passportModule = require('./passport');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true, // 프런트서버와 백엔드 서버 모두 쿠키교환 가능하도록 설정
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cookieParser('test')); // 쿠키 암호화

app.use(session({
  name : '__aleinfeo#', // 쿠키이름 명명
  resave : false,  // 매번 세션 강제 저장
  saveUninitialized : false, // 빈 세션값도 저장
  secret : 'arkiadPass', // 쿠키암호화
  cookie : { 
    httpOnly : true, // 쿠키를 자바스크립트에서 접근 금지
    secure : process.env.SERVICE === "production" ? true : false, // https 사용시 true
  },
}));

passportModule(app);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRoute);

app.listen(port, function () {
  console.log("server works on port :" + port);
});