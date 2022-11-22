const fs = require('fs')

const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.SECRET)

const gUsers = require('../data/users.json')
const utilService = require('./utilService')

module.exports = {
  query,
  getByUsername,
  remove,
  save,
  checkLogin,
  getLoginToken,
  validateToken
}

function query() {
  return Promise.resolve(gUsers.map(user => _mapUserObj(user)))
}

function getByUsername(username) {
  const user = gUsers.find(user => user.username === username)
  if (!user) return Promise.reject('User not found')
  return Promise.resolve(_mapUserObj(user))
}

function save(user) {
  if (user._id) {
    const idx = gUsers.findIndex(({ _id }) => _id === user._id)
    if (idx === -1) return Promise.reject('Invalid user id')
    gUsers[idx] = user
  } else {
    user._id = utilService.makeId()
    gUsers.unshift(user)
  }
  return _saveUsers().then(() => _mapUserObj(user))
}

function remove(userId) {
  const idx = gUsers.findIndex(user => user._id === userId)
  if (idx === -1) return Promise.reject('Invalid user id')
  // console.log('bugService.isUserOwnBugs(userId)', bugService.isUserOwnBugs(userId))
  // if (bugService.isUserOwnBugs(userId)) return Promise.reject('The user own bugs!')


  gUsers.splice(idx, 1)
  return _saveUsers().then(() => 'User deleted successfully')
}

function checkLogin({ username, password }) {
  var user = gUsers.find(user => user.username === username && user.password === password)
  if (!user) return Promise.reject('Incorrect username or password')

  return Promise.resolve(_mapUserObj(user))
}

function getLoginToken(user) {
  return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(token) {
  try {
    const json = cryptr.decrypt(token)
    const loggedinUser = JSON.parse(json)
    return loggedinUser
  } catch (err) {
    console.log('Invalid login token')
  }
  return null
}

// PRIVATES

function _mapUserObj({ _id, username, isAdmin }) {
  return { _id, username, isAdmin }
}

function _saveUsers() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(gUsers, null, 2)

    fs.writeFile('data/users.json', data, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
