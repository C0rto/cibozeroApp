const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  city: { type: String },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Farm' }],
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
