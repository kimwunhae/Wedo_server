const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const sequelize = require("sequelize");
const app = require('../App');
const { user } = require(`../models`)


module.exports = {
    signin(req, res, next) {
        /* 클라이언트에서 Form 태그의 Submit을 통해 들어온 데이터를 Passport를 통해 처리하는 과정입니다*/

        // 인증과정을 처리할 Strategy를 설정하는 부분입니다. *Strategy는 Passport Library에서 제공하는 인증 방식을 뜻합니다.
        passport.use(new LocalStrategy(
            {
                usernameField: `email`,             // Passport에서는 아이디는 username, 비밀번호는 password라는 이름으로 기본적으로 설정되어 있어서,
                passwordField: `password`
            },       // 해당 이름으로 Req 데이터를 받아야 처리되는데, 그 이름을 객체에 담아 변경할 수 있습니다.

            (username, password, done) => {            /* req 받은 username(email)과 password를 DB와 비교하는 데이터 처리 함수를 정의했습니다. */
                user.findOne({
                    where: {
                        email: username,
                        password: password
                    }
                })
                    .then(data => {
                        if (data) {
                            return done(null, data.dataValues)
                        } else {
                            return done(null, false, { message: `아이디나 비밀번호를 확인해주세요` })
                        }
                    })
            }))

        // 위에서 정의한 함수를 바탕으로, 실제로 Success와 Failure 결과를 반환하는 함수입니다. app.post('/signin', callback)의 callback 자리에 들어가는 함수입니다.
        // callback으로 사용될 경우 인자가 필요 없지만, 지금과 같이 떨어져 있는 경우에는 뒤에 (req, res) 인자를 반드시 줘야합니다(실행의 개념).
        passport.authenticate('local', {
            successRedirect: 'http://localhost:3000/main',
            failureRedirect: 'http://localhost:3000/'
        })(req, res, next)

        // authenticate에서 Success 되었다면, 해당 유저를 구분할 수 있도록 Session에 해당 유저의 Unique한 데이터를 담습니다.
        passport.serializeUser((user, done) => { // serializeUser 메소드에 오는 인자 user는 로그인 성공 판정 함수에서 반환하는 해당 유저의 정보입니다. [현재 파일 27번째줄 done의 두번째 인자를 여기로 끌고옵니다.]
            done(null, user.id) // session에 users 테이블의 id값을 담았습니다.
        })


        // serialize가 된 user가 Session을 유지하고 있는지(권한이 있는지) 확인하기위해 페이지 이동시 마다 user의 정보를 확인합니다.
        // 현재 작동 안되는데 왜 안되는지 모르겠습니당

        passport.deserializeUser((userId, done) => {
            console.log('is deserialize working?')
            // user.findById(id, (err, user) => {
            //     done(null, user); // 여기의 user가 req.user가 됨
            //   });
            user.findOne({
                where: {
                    id: userId
                }
            }).then(user => {
                // let { email, nickname, full_name } = data.dataValues
                done(null, user)
            })
        })
    },

    // OAuth를 이용한 Google 로그인
    oAuthGoogle(req, res, next) {
        const googleCredentials = require('../config/google.json');
        passport.use(new GoogleStrategy({ // google Strategy의 환경을 설정합니다.
            clientID: googleCredentials.web.client_id,
            clientSecret: googleCredentials.web.client_secret,
            callbackURL: googleCredentials.web.redirect_uris // Google Page에서 인증이 끝나면 서버의 "/auth/google/redirect"로 Get 요청을 보냅니다. 
        },
            function (request, accessToken, refreshToken, profile, done) { // Google로부터 받은 profile의 email을 DB에서 조회합니다.
                user.findOne({
                    where: { email: profile.emails[0].value }
                })
                    .then(result => {
                        if (result) { done(null, result) } // 이미 있는 email일 경우 해당 record를 done의 인자로 넘깁니다. 
                        else {
                            user
                                .create({ email: profile.emails[0].value, full_name: profile.displayName })
                                .then(newUser => done(null, newUser)) //  DB에 없는 email인 경우 해당 email을 users 테이블에 레코드를 추가하고, 해당 레코드를 done의 인자로 넘깁니다.
                        }
                    })
            }
        ));

        passport.authenticate('google', { scope: ["profile", "email"] })(req, res, next); // 'google' strategy를 통한 로그인이 진행됩니다. * scope는 구글로부터 받아올 정보를 뜻합니다.

        passport.serializeUser((user, done) => { // done의 인자로 받은 유저 정보를 통해 session에 유저의 id(DB상의 id)를 담아줍니다.
            done(null, user.id)
        })

        passport.deserializeUser((userId, done) => {
            console.log('is deserialize working?')
            // user.findById(id, (err, user) => {
            //     done(null, user); // 여기의 user가 req.user가 됨
            //   });
            user.findOne({
                where: {
                    id: userId
                }
            }).then(user => {
                // let { email, nickname, full_name } = data.dataValues
                done(null, user)
            })
        })
    },

    googleRedirect(req, res, next) {    // "/auth/google/redirect"로 들어온 Get 요청을 처리해줍니다. 로그인이 성공한 경우 클라이언트의 /main으로 리다이렉트 해줍니다.
        passport.authenticate('google', { successRedirect: `http://localhost:3000/main` })(req, res, next)
    }
}
