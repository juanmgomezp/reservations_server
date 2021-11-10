const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI)
    .then(db => console.log("Db is conected"))
    .catch(error => console.error)