const axios = require('axios')

let builduserData = () => {
    axios.post(`http://localhost:5000/signup`, { email: `test@test.com`, password: '1234', fullname: 'sungmin', nickname: `nick-sungmin` })
    axios.post(`http://localhost:5000/signup`, { email: `test2@test.com`, password: '1234', fullname: 'friend2', nickname: `friend2` })
    axios.post(`http://localhost:5000/signup`, { email: `test3@test.com`, password: '1234', fullname: 'friend3', nickname: `friend3` })
        .then(buildTodoData())
        .then(buildShareData())
}

let buildTodoData = () => {
    axios.post("http://localhost:5000/todowrite", { title: 'test title', body: 'test body' })
    axios.post("http://localhost:5000/todowrite", { title: 'test title 2', body: 'test body 2' })
    axios.post("http://localhost:5000/todowrite", { title: 'test title 3', body: 'test body 3' })
    axios.post("http://localhost:5000/todowrite", { title: 'test title 4', body: 'test body 4' })
    axios.post("http://localhost:5000/todowrite", { title: 'test title 5', body: 'test body 5' })
    axios.post("http://localhost:5000/todowrite", { title: 'share target', body: 'it must be shared' })
}

let buildShareData = () => {
    axios.post(`http://localhost:5000/sharetodo`, { todoid: '6', friendid: '2' })
    axios.post(`http://localhost:5000/sharetodo`, { todoid: '6', friendid: '3' })
}



builduserData();