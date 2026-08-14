const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: [true, 'Content ID is required']
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// --- Indexing Rationale & Duplicate Prevention ---
// 1. Compound Unique Index on `userId` + `contentId`:
//    Guarantees at the database level that a user cannot bookmark the same content twice.
//    Attempting a duplicate insert throws MongoDB E11000 duplicate key error.
bookmarkSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// 2. Compound Index on `userId` + `createdAt`:
//    Optimizes retrieving a user's bookmarks ordered from newest to oldest.
bookmarkSchema.index({ userId: 1, createdAt: -1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;
