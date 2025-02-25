const mongoose = require('mongoose');

const trelloBoardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrelloTicket' }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const TrelloBoard = mongoose.model('TrelloBoard', trelloBoardSchema);

module.exports = TrelloBoard;
