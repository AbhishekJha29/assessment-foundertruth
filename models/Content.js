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

// Indexes
// 1. Newest-first sorting for content feed
contentSchema.index({ publishedAt: -1 });

// 2. Source-filtered queries sorted by recency
contentSchema.index({ source: 1, publishedAt: -1 });

// 3. Full-text search on title and description
contentSchema.index({ title: 'text', description: 'text' });

const Content = mongoose.models.Content || mongoose.model('Content', contentSchema);
module.exports = Content;
