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

// Indexes
// 1. Compound Unique Index: Prevents duplicate bookmarks per user/content
bookmarkSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// 2. Compound Index: Fast retrieval of user bookmarks ordered by creation time
bookmarkSchema.index({ userId: 1, createdAt: -1 });

const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;
