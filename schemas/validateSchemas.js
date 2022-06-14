const Joi = require('joi');

// non è uno schema mongoose, è uno schema joi che prevede la validazione dei dati prima che arrivino a mongoose

module.exports.farmSchema = Joi.object({
  name: Joi.string().required(),
  holder: Joi.string().required(),
  PIVA: Joi.number(),
  email: Joi.string().email().required(),
  phone: Joi.number().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  country: Joi.string().required().min(3),
  CAP: Joi.number().required(),
  description: Joi.string(),
});

module.exports.reviewSchema = Joi.object({
  body: Joi.string().min(20).required(),
  rating: Joi.number().min(1).max(5).required(),
});

module.exports.productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  description: Joi.string(),
});

// module.exports.userSchema = Joi.object({
//   email: Joi.string().email().required(),
//   city: Joi.string(),
// });
