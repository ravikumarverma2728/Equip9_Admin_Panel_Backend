const express = require('express')
const { login, signup, logout, read, update, Delete } = require('../controllers/userController')
const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout',  logout)
router.get('/read',  read)
router.put('/update',  update)
router.delete('/delete',  Delete)

module.exports = router