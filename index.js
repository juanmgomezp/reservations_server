'use strict';

require('dotenv').config();
const express = require('express');
const axios = require('axios').default;
const ical = require('ical');
const Reservation = require('./models/reservations');
const Calendar = require('./models/calendars');
const morgan = require('morgan');
const cors = require('cors');
const { validateToken, validUser } = require('./auth/auth')

require('./database');
const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.get('/', (req, res) => res.send("Hello"));
app.use('/api', require('./routes/calendars'));
app.use('/api', require('./routes/login'));
app.listen(3000, () => {console.log('Server on port ', 3000)});

app.get('/api/exec/get_reservations', [ validUser ], async (req, res) => {
    try {
        await getReservations();
        const calendar = await Calendar.find().sort({lastCheck: -1}).limit(1).select('lastCheck');
        res.json({executed: true, lastCheck: calendar[0].lastCheck});        
    } catch (error) {
        res.json({type: error, msg: error.message})        
    }
});

app.get('/api/reservations', [ validUser ], async (req, res) => {
    const reservations = await Reservation.find({status: 'CONFIRMED'});
    res.json({reservations: reservations});
});

app.get('/api/reservations/finalized', [ validUser ], async (req, res) => {
    const reservations = await Reservation.find({status: 'FINALIZED'});
    res.json({reservations: reservations});
});

app.get('/api/reservations/cancelled', [ validUser ] ,async (req, res) => {
    const reservations = await Reservation.find({status: 'CANCELLED'});
    res.json({reservations: reservations});
});

app.get('/api/reservations/recent', [ validUser ] ,async (req, res) => {
    const reservations = await Reservation.find({status: 'CONFIRMED'}).sort({createdAt: -1}).limit(20);
    res.json({reservations: reservations});
});

app.get('/api/calendars/last_check', [ validUser ] ,async (req, res) => {
    const calendar = await Calendar.find().sort({lastCheck: -1}).limit(1).select('lastCheck');
    res.json({lastCheck: calendar});
});

app.get('/api/auth/validate', validateToken);

async function updateLastCheck(calendarId, date) {
    const calendar = await Calendar.findByIdAndUpdate(calendarId, {
        $set: {
            lastCheck: date
        }
    });
    console.log(`calendario ${calendar.name} guardado a las ${date}`);
}

function setStart(start){
    const startDate = start.toISOString().substr(0,10) + ' 12:00';
    return startDate;
}

function setEnd(end){
    const endDate = end.toISOString().substr(0,10) + ' 10:00';
    return endDate;
}

function setDate(date){
    const fecha = new Date(date).toISOString().substr(0, 10);
    return fecha;
}

async function getReservations() {
    const reservations = await Reservation.find({status: 'CONFIRMED'}).select('name room uid start end');
    const calendars = await Calendar.find().select('name url room color');

    const today = new Date().toISOString().substr(0,10);
    const forAdd = [];

    for (const calendar of calendars) {
        try {
            const response = await axios.get(calendar.url);
            const data = ical.parseICS(response.data);

            const reservationsForCalendar = reservations.filter(elem => elem.name === calendar.name);
            
            Object.values(data).map(async (event) => {
                if (event.start){
                    const isInCal = reservationsForCalendar.find
                    (res => res.room === calendar.room && event.start.toISOString().substr(0,10) === setDate(res.start));
                    if (isInCal){
                        const index = reservationsForCalendar.indexOf(isInCal);
                        reservationsForCalendar.splice(index, 1);
                    }

                    const isInDb = reservations.find
                    (res => res.room === calendar.room && event.start.toISOString().substr(0,10) === setDate(res.start));
                    if(!isInDb){
                        const isAdded = forAdd.find
                        (elem => elem.room === calendar.room && setDate(elem.start) === event.start.toISOString().substr(0,10));
                        if (!isAdded){
                            const newReservation = new Reservation({
                                name: calendar.name,
                                room: calendar.room,
                                uid: event.uid,
                                summary: event.summary,
                                status: 'CONFIRMED',
                                color: calendar.color,
                                start: setStart(event.start),
                                end: setEnd(event.end)
                            });    
                            forAdd.push(newReservation);                        
                        }
                    }
                }
            });
            if (reservationsForCalendar.length > 0){
                for(const element of reservationsForCalendar){  
                    if (setDate(element.end) <= today){
                        console.log(`salida: ${setDate(element.end)} - hoy: ${today}`)
                        await Reservation.findByIdAndUpdate(element.id, {$set: {status: 'FINALIZED'}});   
                        console.log(`la reservación: ${element} se marcó como finalizada`); 
                    } else {
                        console.log(`salida: ${setDate(element.end)} - hoy: ${today}`)
                        await Reservation.findByIdAndUpdate(element.id, {$set: {status: 'CANCELLED'}});   
                        console.log(`la reservación: ${element} se marcó como cancelada`); 
                    }                  
                }
            }
            await updateLastCheck(calendar.id, new Date().toISOString()); 
        } catch (error) {
            console.log(error);
        }
        console.log('-------------------------------------------------');
    }

    try {
        if (forAdd.length > 0) {
            for(const element of forAdd){
                await element.save();
                console.log(`nueva reservación: 
                ${element.id} - ${element.room} - ${element.start} - ${element.end}`);
            }
        }
    } catch (error) {
        console.log(error)
    }
    console.log('////////////////////////////////////////////////');
    console.log('////////////////////////////////////////////////');
}

getReservations();

setInterval(() => {
    getReservations() 
}, 7200000);