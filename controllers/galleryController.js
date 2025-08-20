const { Gallery } = require('../models/Gallery');
const Class = require('../models/Class');
const { User, ROLES } = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get class gallery
const getClassGallery = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to view gallery
    const userId = req.user._id;
    const userRole = req.user.role;
    const userClass = req.user.class?.toString();
    
    // Super admin, admin can view any class gallery
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
    
    // Class members can view their class gallery
    const isClassMember = userClass === classId;
    const galleryVisibility = classData.privacySettings.galleryVisibility;
    
    const canViewGallery = 
      hasAdminAccess || 
      (isClassMember && galleryVisibility === 'class_only') ||
      (galleryVisibility === 'school') ||
      (galleryVisibility === 'public');
    
    if (!canViewGallery) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view class gallery'
      });
    }
    
    // Get gallery data
    let gallery = await Gallery.findOne({ class: classId })
      .populate('albums.photos.uploadedBy', 'name email profilePicture')
      .populate('albums.photos.comments.user', 'name email profilePicture')
      .populate('albums.createdBy', 'name email')
      .populate('recentPhotos.uploadedBy', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .populate('lastUpdatedBy', 'name email');
    
    // If gallery doesn't exist, create it
    if (!gallery) {
      gallery = new Gallery({
        class: classId,
        createdBy: userId
      });
      
      await gallery.save();
    }
    
    res.status(200).json({
      success: true,
      gallery
    });
  } catch (error) {
    console.error('Get class gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching class gallery',
      error: error.message
    });
  }
};

// Create album
const createAlbum = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, event, eventDate, visibility } = req.body;
    const userId = req.user._id;
    
    // Check if class exists
    const classData = await Class.findById(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if user has permission to create albums
    const userRole = req.user.role;
    const userClass = req.user.class?.toString();
    
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER].includes(userRole);
    const isClassOfficer = [ROLES.CLASS_PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.SECRETARY].includes(userRole);
    const isClassMember = userClass === classId;
    
    if (!hasAdminAccess && !(isClassOfficer && isClassMember)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create albums'
      });
    }
    
    // Get gallery
    let gallery = await Gallery.findOne({ class: classId });
    
    // If gallery doesn't exist, create it
    if (!gallery) {
      gallery = new Gallery({
        class: classId,
        createdBy: userId
      });
    }
    
    // Create album
    const albumData = {
      title,
      description,
      event,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      visibility: visibility || 'class_only',
      createdBy: userId,
      createdAt: new Date()
    };
    
    await gallery.createAlbum(albumData);
    
    res.status(201).json({
      success: true,
      message: 'Album created successfully',
      album: gallery.albums[gallery.albums.length - 1]
    });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating album',
      error: error.message
    });
  }
};

// Get album by ID
const getAlbumById = async (req, res) => {
  try {
    const { classId, albumId } = req.params;
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId })
      .populate('albums.photos.uploadedBy', 'name email profilePicture')
      .populate('albums.photos.comments.user', 'name email profilePicture')
      .populate('albums.createdBy', 'name email');
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    // Find album
    const album = gallery.albums.id(albumId);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }
    
    // Check if user has permission to view album
    const userId = req.user._id;
    const userRole = req.user.role;
    const userClass = req.user.class?.toString();
    
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
    const isClassMember = userClass === classId;
    
    const canViewAlbum = 
      hasAdminAccess || 
      (isClassMember && album.visibility === 'class_only') ||
      (album.visibility === 'school') ||
      (album.visibility === 'public');
    
    if (!canViewAlbum) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this album'
      });
    }
    
    res.status(200).json({
      success: true,
      album
    });
  } catch (error) {
    console.error('Get album by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching album',
      error: error.message
    });
  }
};

// Upload photo to album
const uploadPhoto = async (req, res) => {
  try {
    const { classId, albumId } = req.params;
    const { title, description, imageUrl, cloudinaryId, tags } = req.body;
    const userId = req.user._id;
    
    // Validate image URL
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId });
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    // Find album
    const album = gallery.albums.id(albumId);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }
    
    // Check if user has permission to upload photos
    const userRole = req.user.role;
    const userClass = req.user.class?.toString();
    
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER].includes(userRole);
    const isClassOfficer = [ROLES.CLASS_PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.SECRETARY].includes(userRole);
    const isClassMember = userClass === classId;
    
    if (!hasAdminAccess && !(isClassOfficer && isClassMember)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload photos'
      });
    }
    
    // Create photo
    const photoData = {
      title,
      description,
      imageUrl,
      cloudinaryId,
      uploadedBy: userId,
      uploadedAt: new Date(),
      tags: tags || []
    };
    
    await gallery.addPhotoToAlbum(albumId, photoData);
    
    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: album.photos[album.photos.length - 1]
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while uploading photo',
      error: error.message
    });
  }
};

// Like photo
const likePhoto = async (req, res) => {
  try {
    const { classId, albumId, photoId } = req.params;
    const userId = req.user._id;
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId });
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    await gallery.likePhoto(albumId, photoId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Photo liked successfully'
    });
  } catch (error) {
    console.error('Like photo error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while liking photo',
      error: error.message
    });
  }
};

// Comment on photo
const commentOnPhoto = async (req, res) => {
  try {
    const { classId, albumId, photoId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId });
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    const commentData = {
      user: userId,
      text,
      createdAt: new Date()
    };
    
    await gallery.commentOnPhoto(albumId, photoId, commentData);
    
    // Get the updated photo with populated comment user
    const updatedGallery = await Gallery.findOne({ class: classId })
      .populate('albums.photos.comments.user', 'name email profilePicture');
    
    const album = updatedGallery.albums.id(albumId);
    const photo = album.photos.id(photoId);
    const newComment = photo.comments[photo.comments.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Comment on photo error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while adding comment',
      error: error.message
    });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const { classId, albumId, photoId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId });
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    // Find album
    const album = gallery.albums.id(albumId);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }
    
    // Find photo
    const photo = album.photos.id(photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }
    
    // Check if user has permission to delete photo
    const isPhotoOwner = photo.uploadedBy.toString() === userId.toString();
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER].includes(userRole);
    const isClassPresident = userRole === ROLES.CLASS_PRESIDENT && req.user.class?.toString() === classId;
    
    if (!isPhotoOwner && !hasAdminAccess && !isClassPresident) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this photo'
      });
    }
    
    // Delete from Cloudinary if cloudinaryId exists
    if (photo.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(photo.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue even if Cloudinary delete fails
      }
    }
    
    // Remove photo from album
    album.photos = album.photos.filter(p => p._id.toString() !== photoId);
    
    // Update cover image if needed
    if (album.coverImage === photo.imageUrl && album.photos.length > 0) {
      album.coverImage = album.photos[0].imageUrl;
    }
    
    // Remove from recent photos if present
    gallery.recentPhotos = gallery.recentPhotos.filter(p => p._id.toString() !== photoId);
    
    gallery.lastUpdatedBy = userId;
    
    await gallery.save();
    
    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting photo',
      error: error.message
    });
  }
};

// Update album
const updateAlbum = async (req, res) => {
  try {
    const { classId, albumId } = req.params;
    const { title, description, event, eventDate, visibility } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId });
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    // Find album
    const album = gallery.albums.id(albumId);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }
    
    // Check if user has permission to update album
    const isAlbumCreator = album.createdBy.toString() === userId.toString();
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER].includes(userRole);
    const isClassPresident = userRole === ROLES.CLASS_PRESIDENT && req.user.class?.toString() === classId;
    
    if (!isAlbumCreator && !hasAdminAccess && !isClassPresident) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this album'
      });
    }
    
    // Update album
    if (title) album.title = title;
    if (description !== undefined) album.description = description;
    if (event) album.event = event;
    if (eventDate) album.eventDate = new Date(eventDate);
    if (visibility) album.visibility = visibility;
    
    gallery.lastUpdatedBy = userId;
    
    await gallery.save();
    
    res.status(200).json({
      success: true,
      message: 'Album updated successfully',
      album
    });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating album',
      error: error.message
    });
  }
};

// Delete album
const deleteAlbum = async (req, res) => {
  try {
    const { classId, albumId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId });
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    // Find album
    const album = gallery.albums.id(albumId);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }
    
    // Check if user has permission to delete album
    const isAlbumCreator = album.createdBy.toString() === userId.toString();
    const hasAdminAccess = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CLASS_TEACHER].includes(userRole);
    const isClassPresident = userRole === ROLES.CLASS_PRESIDENT && req.user.class?.toString() === classId;
    
    if (!isAlbumCreator && !hasAdminAccess && !isClassPresident) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this album'
      });
    }
    
    // Delete photos from Cloudinary
    for (const photo of album.photos) {
      if (photo.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryId);
        } catch (cloudinaryError) {
          console.error('Cloudinary delete error:', cloudinaryError);
          // Continue even if Cloudinary delete fails
        }
      }
      
      // Remove from recent photos if present
      gallery.recentPhotos = gallery.recentPhotos.filter(p => p._id.toString() !== photo._id.toString());
    }
    
    // Remove album
    gallery.albums = gallery.albums.filter(a => a._id.toString() !== albumId);
    
    gallery.lastUpdatedBy = userId;
    
    await gallery.save();
    
    res.status(200).json({
      success: true,
      message: 'Album deleted successfully'
    });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting album',
      error: error.message
    });
  }
};

// Get recent photos
const getRecentPhotos = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Get gallery
    const gallery = await Gallery.findOne({ class: classId })
      .populate('recentPhotos.uploadedBy', 'name email profilePicture');
    
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }
    
    res.status(200).json({
      success: true,
      photos: gallery.recentPhotos
    });
  } catch (error) {
    console.error('Get recent photos error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching recent photos',
      error: error.message
    });
  }
};

module.exports = {
  getClassGallery,
  createAlbum,
  getAlbumById,
  uploadPhoto,
  likePhoto,
  commentOnPhoto,
  deletePhoto,
  updateAlbum,
  deleteAlbum,
  getRecentPhotos
};

