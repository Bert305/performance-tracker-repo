const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    description: { type: String },
    assignedDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    complexity: { type: Number, required: true },
    status: { type: String, enum: ['todo', 'inProgress', 'done'], default: 'todo' } // Add status to track progress
});

const PerformanceMetricSchema = new mongoose.Schema({
    qualityScore: { type: Number, required: true },
    quantityScore: { type: Number, required: true },
    overallScore: { type: Number, required: true }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    teamID: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamName: { type: String }, // Change teamName to String type
    tasks: [TaskSchema],
    performanceMetrics: PerformanceMetricSchema,
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    totalSprintTickets: { type: Number, default: 0 }, // Total tickets in the sprint
    inProgressTickets: { type: Number, default: 0 }, // Tickets currently in progress
    doneTickets: { type: Number, default: 0 } // Tickets marked as done
});

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











