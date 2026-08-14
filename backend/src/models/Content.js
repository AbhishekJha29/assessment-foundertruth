const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true
    },
    url: {
      type: String,
      required: [true, 'Canonical URL is required'],
      unique: true,
      trim: true
    },
    image: {
      type: String,
      trim: true,
      default: null
    },
    publishedAt: {
      type: Date,
      required: [true, 'Publication date is required'],
      default: Date.now
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

// --- Indexing Rationale ---
// 1. `unique: true` on `url`: Prevents duplicate articles from being ingested across feeds.
// 2. `publishedAt: -1`: Enables fast reverse-chronological sorting for the content feed (newest first).
contentSchema.index({ publishedAt: -1 });

// 3. `{ source: 1, publishedAt: -1 }`: Optimizes filtered queries (e.g. filter by source sorted by recency).
contentSchema.index({ source: 1, publishedAt: -1 });

// 4. Text index on `title` and `description`: Powers keyword and full-text search across content.
contentSchema.index({ title: 'text', description: 'text' });

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
