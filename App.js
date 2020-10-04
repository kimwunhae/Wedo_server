const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport')
const controller = require('./controller/index');
const auth = require('./controller/authentication');
const LocalStrategy = require('passport-local').Strategy
const cors = require('cors');
const path = require('path');

const models = require('./models/index');

// const usersRouter = require('');
// const linkRouter = require('');

const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

app.use(
    session({
        secret: '@4B', // 상의 후 결정
        resave: false,
        saveUninitialized: true
    })
);

// cookieParser로 넘어온 cookie데이터를 관리 쉽게 JSON객체로 변환
app.use(cookieParser());

//passport 관련 middleware
app.use(bodyParser.urlencoded({ extended: false })) // 없으면 passport.use(new LocalStrategy()) 가 실행되지 않습니다.
app.use(bodyParser.json())

// express.json 으로 넘어온 데이터 JSON 객체로 변환

app.use(express.json());


models.sequelize.sync()
    .then(() => console.log('동기화 성공'))
    .catch(e => console.log(e));


app.use(
    cors({
        origin: ["http://localhost:3000/*", "http://localhost:5000/*"],
        method: ["GET", "POST"],
        credentials: true
    })
);
app.use(passport.initialize())
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'html')));
// POSTMAN을 통한 test
app.use(morgan('dev'));



// app.post("/signin", controller.signInController); => passport Local 인증 구현으로 사용 안하게 되었습니당.
// PASSPORT 를 통한 로컬 로그인 구현
app.post('/signin', auth.signin)

//PASSPORT - OAUTH2.0 - GOOGLE
app.get('/auth/google', (req, res, next) => auth.oAuthGoogle(req, res, next))
app.get('/auth/google/redirect', auth.googleRedirect)
app.get(`/userinfo`, controller.userinfoController)
app.post(`/friendinfo`, controller.friendinfoController);

// get 요청에 대한 응답 (API)
app.post("/signup", controller.signUpController);
app.post("/signout", controller.signOutController);
app.post("/signeditnickname", controller.signEditNickname);
app.post("/signeditpassword", controller.signEditPassword);
app.post("/userDelete", controller.userDelete);

app.get("/mypage", controller.mypageController);
app.get("/main", controller.mainController);
app.post("/todoedit", controller.todoEdit);
app.post("/todowrite", controller.todoWrite);
app.post("/tododelete", controller.todoDelete);
app.post("/todoclear", controller.todoClear);

app.post("/followadd", controller.followAdd);
app.get("/followlist", controller.followList);
app.post("/followdelete", controller.followDelete);

app.post("/sharetodo", controller.shareTodo);
// app.get("/sharelist", controller.shareList);
app.post("/sharedelete", controller.shareDelete);
app.post("/shareclear", controller.shareClear);


app.set('port', port);
app.listen(app.get('port'), () => {
    console.log(`app is listening music in PORT ${app.get('port')}`);
});




module.exports = app, session;
///
