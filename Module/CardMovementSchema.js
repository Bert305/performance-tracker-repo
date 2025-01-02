const mongoose = require('mongoose');
const { Schema } = mongoose;

const CardMovementSchema = new Schema({
    cardID: { type: String, required: true },
    cardName: { type: String, required: true },  // Add card name
    fromListName: { type: String, required: true },
    toListName: { type: String, required: true },
    entryTimestamp: { type: Date, required: true, default: Date.now },
    exitTimestamp: { type: Date }
});

const CardMovement = mongoose.model('CardMovement', CardMovementSchema);
module.exports = CardMovement;
