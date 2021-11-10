const { Router } = require('express');
const login = require('../controllers/login')

const router = Router();

router.route('/login')
    .post(login)

module.exports = router;