const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    description: { type: String },
    assignedDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    complexity: { type: Number, required: true }
});

const PerformanceMetricSchema = new mongoose.Schema({
    qualityScore: { type: Number, required: true },
    quantityScore: { type: Number, required: true },
    overallScore: { type: Number, required: true }
});

const TeamMemberSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    teamID: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamName: { type: String }, // Add team name field
    tasks: [TaskSchema],
    performanceMetrics: PerformanceMetricSchema
});

const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);

module.exports = TeamMember;




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











