const Calendar = require('../models/calendars');

const addCalendar = async (req, res) => {
    const { name, url, room } = req.body;
    try {
        const calendar = new Calendar({
            name: name,
            url: url,
            room: room
        }); 
        await calendar.save();
        res.status(200).send('calendario agregado');
    } catch (error) {
        console.log(error);
        res.status(404).send('algo salio mal');
    }
}

module.exports = addCalendar;