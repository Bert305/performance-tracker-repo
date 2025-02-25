const mongoose = require('mongoose');

const trelloTicketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['To Do', 'In Progress', 'QA', 'Done'], required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    avatarImage: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

const TrelloTicket = mongoose.model('TrelloTicket', trelloTicketSchema);

module.exports = TrelloTicket;
