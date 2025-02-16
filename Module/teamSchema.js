const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { strictPopulate: false });

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;


