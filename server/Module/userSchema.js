const mongoose = require('mongoose')

const User = mongoose.Schema({
    position: {type: String, required: true},
    company_name: {type: String, required: true},
    link: {type: String, required: true},
    date: {type: String, required: true},
    applied: {type: String, required: true},
    notes: {type: String, required: true}
})

module.exports = mongoose.model('User', User);