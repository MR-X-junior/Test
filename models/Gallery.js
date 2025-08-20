const mongoose = require('mongoose');

// Schema for individual photos
const PhotoSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryId: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Schema for photo albums
const AlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Album title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    trim: true
  },
  photos: [PhotoSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  event: {
    type: String,
    trim: true
  },
  eventDate: {
    type: Date
  },
  visibility: {
    type: String,
    enum: ['class_only', 'school', 'public'],
    default: 'class_only'
  }
});

// Main gallery schema for a class
const GallerySchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  albums: [AlbumSchema],
  recentPhotos: [PhotoSchema], // For quick access to recent photos
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to add a photo to an album
GallerySchema.methods.addPhotoToAlbum = function(albumId, photoData) {
  const album = this.albums.id(albumId);
  
  if (!album) {
    throw new Error('Album not found');
  }
  
  album.photos.push(photoData);
  
  // Update the cover image if this is the first photo
  if (!album.coverImage && album.photos.length === 1) {
    album.coverImage = photoData.imageUrl;
  }
  
  // Add to recent photos as well (limited to 10)
  this.recentPhotos.unshift(photoData);
  if (this.recentPhotos.length > 10) {
    this.recentPhotos.pop();
  }
  
  this.lastUpdatedBy = photoData.uploadedBy;
  
  return this.save();
};

// Method to create a new album
GallerySchema.methods.createAlbum = function(albumData) {
  this.albums.push(albumData);
  this.lastUpdatedBy = albumData.createdBy;
  
  return this.save();
};

// Method to like a photo
GallerySchema.methods.likePhoto = function(albumId, photoId, userId) {
  const album = this.albums.id(albumId);
  
  if (!album) {
    throw new Error('Album not found');
  }
  
  const photo = album.photos.id(photoId);
  
  if (!photo) {
    throw new Error('Photo not found');
  }
  
  // Check if user already liked the photo
  if (!photo.likes.includes(userId)) {
    photo.likes.push(userId);
  }
  
  return this.save();
};

// Method to comment on a photo
GallerySchema.methods.commentOnPhoto = function(albumId, photoId, commentData) {
  const album = this.albums.id(albumId);
  
  if (!album) {
    throw new Error('Album not found');
  }
  
  const photo = album.photos.id(photoId);
  
  if (!photo) {
    throw new Error('Photo not found');
  }
  
  photo.comments.push(commentData);
  
  return this.save();
};

module.exports = mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);

