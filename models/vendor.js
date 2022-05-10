const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const VendorSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  farm: [{ type: Schema.Types.ObjectId, ref: 'Farm' }],
});
VendorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Vendor', VendorSchema);
