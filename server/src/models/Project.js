const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

projectSchema.pre('save', function (next) {
  const seen = new Set();
  const normalizedMembers = [];

  if (this.owner) {
    normalizedMembers.push(this.owner);
    seen.add(this.owner.toString());
  }

  for (const memberId of this.members || []) {
    const id = memberId.toString();
    if (!seen.has(id)) {
      normalizedMembers.push(memberId);
      seen.add(id);
    }
  }

  this.members = normalizedMembers;
  next();
});

module.exports = mongoose.model('Project', projectSchema);
