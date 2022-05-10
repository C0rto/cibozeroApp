const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./reviews');
const Product = require('./products');

const farmSchema = new Schema({
  name: { type: String, required: true },
  holder: { type: String, required: true },
  PIVA: { type: Number, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  CAP: { type: Number, required: true },
  country: {
    type: String,
    enum: [
      'Abruzzo',
      'Basilicata',
      'Calabria',
      'Campania',
      'Emilia-Romagna',
      'Friuli-Venezia Giulia',
      'Lazio',
      'Liguria',
      'Lombardia',
      'Marche',
      'Molise',
      'Piemonte',
      'Puglia',
      'Sardegna',
      'Sicilia',
      'Toscana',
      'Trentino-Alto Adige',
      'Umbria',
      "Valle d'Aosta",
      'Veneto',
    ],
  },
  description: { type: String, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});
// post function for deleting all products from a deleted Farm è un middleware di mongoose di tipo post e si basa sulla query. Ha bisogno dei modelli di prodotto e recensione che deve eliminare con la proprietà $in, elimina i prodotti e le recensioni il cui id si trova nell'array dei prodotti e delle recensioni di quella farm che viene eliminata. In pratica elimina recensioni e prodotti associati alla farm
farmSchema.post('findOneAndDelete', async function (farm) {
  if (farm.products.length || farm.reviews.lenght) {
    await Product.deleteMany({ _id: { $in: farm.products } });
    await Review.deleteMany({ _id: { $in: farm.reviews } });
  }
});
// exporting Schema
const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;
