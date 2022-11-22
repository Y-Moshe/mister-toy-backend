const fs = require('fs')
const utilService = require('./utilService')

const gToys = require('../data/toys.json')

module.exports = {
  query,
  getById,
  remove,
  save
}

function query(filterBy) {
  const name = filterBy.name || ''
  const page = +filterBy.page || 0
  const itemsPerPage = +filterBy.itemsPerPage || 6

  const regex = new RegExp(name, 'i')
  let filteredToys = gToys.filter(toy => regex.test(toy.name))
  const startIdx = page * itemsPerPage
  const totalPages = Math.ceil(filteredToys.length / itemsPerPage)
  if (itemsPerPage !== Infinity) filteredToys = filteredToys.slice(startIdx, startIdx + itemsPerPage)

  return Promise.resolve({
    totalPages,
    toys: filteredToys
  })
}

function getById(toyId) {
  const toy = gToys.find(toy => toy._id === toyId)
  if (!toy) return Promise.reject('invalid toy id')
  return Promise.resolve(toy)
}

function save(toy) {
  if (toy._id) {
    const idx = gToys.findIndex(({ _id }) => _id === toy._id)
    if (idx === -1) return Promise.reject('invalid toy id')
    gToys[idx] = {
      ...gToys[idx],
      ...toy
    }
  } else {
    toy._id = utilService.makeId()
    gToys.unshift(toy)
  }
  return _saveToys().then(() => toy)
}

function remove(toyId) {
  const idx = gToys.findIndex(toy => toy._id === toyId)
  if (idx === -1) return Promise.reject('invalid toy id')
  gToys.splice(idx, 1)
  return _saveToys()
}

// PRIVATES

function _saveToys() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(gToys, null, 2)

    fs.writeFile('data/toys.json', data, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
