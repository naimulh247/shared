const mongoose = require('mongoose');
const Profile = require('./Profile');
const User = require('./User');

const postSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      trim: true,
    },
    hashtag: Array,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // comment: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Comment',
    // },
  },
);


postSchema.pre('save', function (next) {
  let content = this.content.replace(/\s/g, '');
  console.log(content);
  let hashTagIndex = content.indexOf('#');
  if (hashTagIndex === -1) {
    this.hashtag = undefined;
    return next();
  }
  let hashTagSplice = content.slice(hashTagIndex);
  //let res= hashTagSplice.replace(/#/, '').split('#');

  this.hashtag = hashTagSplice.replace(/#/, '').split('#');
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
