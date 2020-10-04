const { user } = require('../models');
const { todo } = require('../models');
const { follow } = require('../models')
const { todo_user } = require('../models')
const sequelize = require("sequelize");

const crypto = require('crypto');
/* passport로 로그인을 구현하면서 session 구조가 아래와 같이 바뀌었습니다.
{ cookie : { ... }, passport : { user : 유저레코드 아이디 }
따라서 sess = req.session을 session_userid = req.session.passport.user 로
수정합니다. */

// Signin이 Passport로 구현되면서 Signin Controller를 삭제처리 했습니다.
const Op = sequelize.Op;

module.exports = {
    userinfoController: (req, res) => {
        const session_userid = req.session.passport.user;

        user.findOne({
            where: {
                id: session_userid
            }
        })
            .then(data => res.status(200).json(data))
    },

    friendinfoController: (req, res) => {
        let { id } = req.body
        user.findOne({
            where: {
                id: id
            }
        })
            .then(data => res.status(200).json(data))

    },
    signUpController: (req, res) => {
        const { email, password, fullname, nickname } = req.body;

        user.findOrCreate({
            where: {
                email: email,
            },
            defaults: {
                password: password,
                full_name: fullname,
                nickname: nickname
            }
        })
            .then(async ([user, created]) => {
                if (!created) {
                    console.log(req.session.passport.user)
                    return res.status(409).send("이미 존재하는 email입니다.");
                }
                const data = await user.get({ plain: true });
                console.log(req.session)
                res.status(201).json(data);
            });
    },
    mypageController: (req, res) => {
        const session_userid = req.session.passport.user;
        if (session_userid) {
            user.findOne({
                where: {
                    id: session_userid,
                },
            })
                .then((data) => {
                    if (data) {
                        return res.status(200).json(data);
                    }
                    res.sendStatus(204);
                })
                .catch((err) => {
                    console.log(err);
                    res.sendStatus(500);
                });
        } else {
            res.status(401).send("세션을 찾지 못했습니다.")
        }
    },
    signEditNickname: (req, res) => {
        const { nickname } = req.body;
        const session_userid = req.session.passport.user
        user.update({ nickname: nickname }, { where: { id: session_userid } })
            .then((data) => {
                console.log(data);
                res.status(200).json(data)
            })
            .catch((err) => {
                console.log(err);
                res.status(500);
            });
    },
    signEditPassword: (req, res) => {
        const { newpassword } = req.body;
        const session_userid = req.session.passport.user;
        /* 수 정 */
        user.update({ password: newpassword }, { where: { id: session_userid } })
            .then(() => {
                res.status(200).send("비밀번호 변경완료!")
            })
            .catch((err) => {
                console.log(err)
                res.status(400)
            })
    },
    signOutController: (req, res) => {
        const session_userid = req.session.passport.user;
        if (session_userid) {
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                    res.status(400).send("로그아웃 실패!")
                } else {
                    res.status(200).send("로그아웃 성공")
                }
            });
        }
    },

    // index.js - 310 번째 줄로 이동.

    // index.js - 310 번째 줄로 이동.

    // mainController: (req, res) => {
    //     //내가 작성한 todo 의 list를 가져옵니다.
    //     const session_userid = req.session.passport.user
    //     todo.findAll({
    //         where: { user_id: session_userid }
    //     })
    //         .then((data) => { res.status(200).json(data) })
    //         .catch((err) => {
    //             console.log("데이터를 조회할수 없습니다.", err);
    //             res.status(500);
    //         })
    // },

    todoWrite: (req, res) => {
        const session_userid = req.session.passport.user;
        const { title, body } = req.body;
        user
            .findOne({
                where: {
                    id: session_userid
                }
            })
            .then((data) => {
                todo
                    .create({
                        user_id: data.id,
                        title: title,
                        body: body
                    })
                    .then((data) => {
                        console.log(req.session)
                        res.status(200).json(data);
                    }
                    ).catch((err) => {
                        console.log(err);
                        res.sendStatus(500);
                    });
            })
    },

    todoEdit: (req, res) => {
        const { id, title, body } = req.body;

        todo.update({ title: title, body: body }, { where: { id: id } })
            .then(() => {
                todo.findOne({
                    where: {
                        id: id
                    }
                })
                    .then((data) => res.status(200).json(data))
                    .catch((err) => {
                        console.log(err);
                        res.sendStatus(500);
                    });
            })
    },

    todoDelete: (req, res) => {
        const { id } = req.body
        const session_userid = req.session.passport.user;

        todo.destroy({ where: { id: id } })
            .then(() => { //then에 .이 빠져있어서 채워넣었습니다.
                todo.findAll({
                    where: {
                        user_id: session_userid
                    }
                })
                    .then((data) => {
                        res.status(200).json(data)
                    })
                    .catch(err => {
                        console.error(err);
                    })
            })
    },
    todoClear: (req, res) => {
        const { id } = req.body;
        todo.findOne({
            where: { id: id }
        })
            .then((data) => {
                if (data.isclear === false) {
                    data.update({ isclear: 1 }, { where: { id: id } })
                        .then(() => res.status(200).json(data))
                } else if (data.isclear === true) {
                    data.update({ isclear: 0 }, { where: { id: id } })
                        .then(() => res.status(200).json(data))
                } else { res.status(400) }
            })
    },


    followAdd: (req, res) => {
        const { friendemail } = req.body;
        const session_userid = req.session.passport.user

        user.findOne({ where: { id: session_userid } })
            .then((myUser) => {
                user.findOne({ where: { email: friendemail } })
                    .then((friend) => {
                        follow.create({
                            userId: myUser.id,
                            friendId: friend.id
                        })
                            .then((data) => {
                                res.status(200).json(data)
                            })
                    })
                    .catch((err) => {
                        console.log("일치하는 이메일이 없습니다.", err)
                        res.status(400).send("일치하는 email이 없습니다.")
                    })
            })
    },

    followList: (req, res) => {
        const session_userid = req.session.passport.user
        user.findOne({
            where: { id: session_userid },
            include: [{
                model: user,
                as: 'friend',
                attributes: ['id', 'nickname', 'full_name', 'email'], // user정보에 full_name이 빠져있어서 채워넣었습니다.
                through: {
                    attributes: ['id', 'userId', 'friendId', 'block']
                }
            }]
        })
            .then((data) => {
                console.log(req.session)
                res.status(200).json(data);
            })
            .catch((err) => {
                console.log(req.session)
                console.log("목록을 불러오는데에 에러:", err);
                res.status(400).send("불러올 친구가 없나봅니다.human")
            })
    },

    followDelete: (req, res) => {
        const session_userid = req.session.passport.user;
        const { friendid } = req.body;
        follow.destroy({
            where: {
                userId: session_userid,
                friendId: friendid
            }
        })
            .then(() => {
                user.findOne({
                    where: { id: session_userid },
                    include: [{
                        model: user,
                        as: 'friend',
                        through: {
                            attributes: ['id', 'userId', 'friendId', 'block']
                        }
                    }]
                })
                    .then((data) => {
                        console.log(req.session)
                        res.status(200).json(data);
                    })
                    .catch((err) => {
                        console.log(req.session)
                        console.log("목록을 불러오는데에 에러:", err);
                        res.status(400).send("불러올 친구가 없나봅니다.human")
                    })
            })
            .catch((err) => res.status(400).send("삭제불가", err))
    },

    shareTodo: (req, res) => {
        //share gks todo의 정보와 그안에 담긴 users를 가져옵니다. 
        const { todoid, friendid } = req.body;
        todo.findOne({ where: { id: todoid }, },
        )
            .then((data) => {
                user.findOne({ where: { id: friendid } })
                    .then((friend) => {
                        console.log(data, friend)
                        data.addUsers(friend) //혁신 2020.10.01
                    }).then(() => {
                        todo.findOne({
                            where: { id: todoid },
                            include: [{
                                model: user,
                                attributes: ['id', 'nickname', 'email'],
                                through: {
                                    attributes: ['id', 'isclear', 'userId', 'todoId']
                                }
                            }]
                        }).then(data => {
                            res.status(200).json(data)
                        })
                    })
            })
            .catch((err) => {
                console.log("글을 공유할 수 없습니다.", err);
                res.status(400).send();
            })
    },

    mainController: (req, res) => {
        const Op = sequelize.Op;
        const session_userid = req.session.passport.user
        todo.findAll({
            where: {
                [Op.or]: [{ user_id: session_userid }, { '$users.id$': session_userid }]
            },
            // 나의 todo와 내가 share 당한 todo를 가져옵니다.(나와 관계있는 모든 todo의 list).

            // where: { '$users.id$': session_userid },
            // 내가 share 당한 todo list만 가져오는 ver.
            include: {
                model: user,
                attributes: ['id', 'nickname', 'full_name', 'email'],
                through: {
                    attributes: ['id', 'isclear', 'userId', 'todoId']
                }
            }
        })
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                console.log("공유글을 불러올 수 없습니다.", err)
                res.status(400).send("공유글을 불러올 수 없습니다.")
            })
    },

    shareClear: (req, res) => {
        const { todoid } = req.body;
        const Op = sequelize.Op;
        const session_userid = req.session.passport.user

        todo_user.findOne({
            where: {
                userId: session_userid,
                todoId: todoid
            },
        })
            .then((data) => {
                if (data.isclear === false) {
                    data.update({ isclear: 1 })
                        .then(() => res.status(200).json(data))
                } else if (data.isclear === true) {
                    data.update({ isclear: 0 })
                        .then(() => res.status(200).json(data))
                } else { res.status(400) }
            })
            .catch(e => console.log(e))
    },

    shareDelete: (req, res) => {
        const { shareid } = req.body;
        const session_userid = req.session.passport.user
        todo_user.destroy({
            where: {
                id: shareid
            }
        })
            .then(() => {
                todo.findAll({
                    where: {
                        [Op.or]: [{ '$users.id$': session_userid }, { user_id: session_userid }]
                    },
                    include: [{
                        model: user,
                        attributes: ['id', 'nickname', 'email'],
                        through: {
                            attributes: ['id', 'isclear', 'userId', 'todoId']
                        }
                    }]
                })
                    .then((data) => {
                        res.status(200).json(data);
                    })
            })
            .catch((err) => res.status(400).send("삭제불가", err))
    },

    userDelete: (req, res) => {

        const { id } = req.body

        user.destroy({
            where: { id: id }
        })
            .then(() => {
                res.status(200).send("회원 탈퇴 완료!")
            })
            .catch(() => {
                res.status(400).send("탈퇴 실패!")
            })
    }
}