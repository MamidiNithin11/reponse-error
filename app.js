const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const dbpath = path.join(__dirname, 'twitterClone.db')
let db = null

const initilizeDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at https://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initilizeDBServer()

const validatepassword = password => {
  return password.length < 6
}
app.post('/register/', async (request, response) => {
  const {username, name, password, gender} = request.body
  const selectUser = `SELECT * FROM user WHERE username='${username}';`
  const dbUser = await db.get(selectUser)
  const hashedPassword = await bcrypt.hash(password, 10)

  if (dbUser === undefined) {
    const selectuserQuery = `
    INSERT INTO (username,password,name,gender) VALUES ('${username}','${hashedPassword}','${name}','${gender}');`

    if (validatepassword(password)) {
      await db.run(selectuserQuery)
      response.status(200).send('User created successfully')
    } else {
      response.status(400).send('Password is too short')
    }
  } else {
    response.status(400).send('User already exists')
  }
})

module.exports = app
