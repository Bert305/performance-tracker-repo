const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrelloBoard' }] // Link to Trello boards
});

userSchema.methods.comparePassword = function(candidatePassword) {
    return candidatePassword === this.password;
}

const User = mongoose.model('User', userSchema);

module.exports = User;




// const mongoose = require('mongoose')

// const User = mongoose.Schema({
//     position: {type: String, required: true},
//     company_name: {type: String, required: true},
//     link: {type: String, required: true},
//     date: {type: String, required: true},
//     applied: {type: String, required: true},
//     notes: {type: String, required: true}
// })

// module.exports = mongoose.model('User', User);











