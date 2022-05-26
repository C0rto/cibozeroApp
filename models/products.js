const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary');
const { Schema } = mongoose;
// ------------------------------------------------------------------------------------
const ImageSchema = new Schema({
  url: String,
  filename: String,
});
// ------------------------------------------------------------------------------------
ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_150');
});
// ------------------------------------------------------------------------------------
const productSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
  },
  price: {
    type: Number,
    float: true,
    required: true,
    min: 0,
  },
  season: {
    type: String,
    lowercase: true,
    enum: ['autunno', 'inverno', 'estate', 'primavera', 'full'],
  },
  category: {
    type: String,
    lowercase: true,
    enum: [
      'ortofrutta',
      'carne',
      'pesce',
      'salumi e formaggi',
      'pasta, riso, cereali, farine',
      'pane e prodotti da forno',
      'vino e altre bevande alcoliche',
      'bevande analcoliche',
      'altro',
    ],
  },
  description: {
    type: String,
  },
  image: ImageSchema,
  farm: [{ type: Schema.Types.ObjectId, ref: 'Farm' }],
});
// ------------------------------------------------------------------------------------
// erase image from cloudinary postmiddleware
// productSchema.post('findOneAndDelete', async function (product) {
//   await cloudinary.uploader.destroy(product.image.filename);
// });

// ------------------------------------------------------------------------------------
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
