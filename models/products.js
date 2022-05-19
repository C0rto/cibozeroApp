const { string } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    enum: ["autunno", "inverno", "estate", "primavera", "full"],
  },
  category: {
    type: String,
    lowercase: true,
    enum: [
      "ortofrutta",
      "carne",
      "pesce",
      "salumi e formaggi",
      "pasta, riso, cereali, farine",
      "pane e prodotti da forno",
      "vino e altre bevande alcoliche",
      "bevande analcoliche",
      "altro",
    ],
  },
  description: {
    type: String,
  },
  image: [{ url: String, filename: String }],
  farm: [{ type: Schema.Types.ObjectId, ref: "Farm" }],
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
