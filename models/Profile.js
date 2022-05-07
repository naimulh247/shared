const mongoose = require('mongoose');
const validator = require('validator');


const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bio: {
      type: String,
      trim: true,
    },
   
    accountType: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: [true, 'Username is taken'],
    },
    photo: {
      type: Object,
      default:
        'https://st2.depositphotos.com/1009634/7235/v/950/depositphotos_72350117-stock-illustration-no-user-profile-picture-hand.jpg',
    },
    // requests: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Profile',
    //     select: false,
    //   },
    // ],
  },
);


const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
