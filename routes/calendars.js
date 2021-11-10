const { Router } = require('express');
const calendarCtrl = require('../controllers/calendars');

const router = Router();

router.post('/calendar', calendarCtrl)

module.exports = router;