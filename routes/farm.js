const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const Farm = require('../models/farm');
const User = require('../models/user');
const Product = require('../models/products');
const { isLoggedIn, isOwner, validateFarm } = require('../middleware');
const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary/index');
const upload = multer({ storage });
const { categories, country } = require('../helpers/datas');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// MONGOSE CONNECTION
const mongoose = require('mongoose');
const { object } = require('joi');
// -------------------------------------------------------------------------------
mongoose.connect('mongodb://localhost:27017/123');
const db = mongoose.connection;
db.on('Error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected');
});
//------------------------------------------------- INDICE DI TUTTI I PRODUTTORI HOME PAGE PRODUTTORI ----------------------------------------------------------------------------//
router.get(
  '/',
  catchAsync(async (req, res) => {
    const farms = await Farm.find({});
    res.render('farms/index', { farms });
  })
);

//------------------------------------------------- REGISTRAZIONE DI UN SINGOLO PRODUTTORE ----------------------------------------------------------------------------//
router.get('/registrazione', isLoggedIn, (req, res) => {
  res.render('farms/new', { country });
});
router.post(
  '/',
  isLoggedIn,
  validateFarm,
  catchAsync(async (req, res, next) => {
    const { city, district, country, CAP } = req.body;
    const geodata = await geocoder
      .forwardGeocode({
        query: `${city},${district},${country},${CAP}`,
        limit: 1,
      })
      .send();
    const newFarm = new Farm(req.body);
    newFarm.geometry = geodata.body.features[0].geometry;
    newFarm.owner = req.user._id;
    await newFarm.save();
    console.log(newFarm);
    req.flash('success', 'Ti diamo ufficialmente il benvenuto su cibozero');
    res.redirect('/produttori');
  })
);
//------------------------------------------------- VISUALIZZAZIONE DI UN SINGOLO PRODUTTORE TRAMITE ID ----------------------------------------------------------------------------//
router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farmFound = await Farm.findById(id)
      .populate('products')
      .populate('owner')
      .populate({ path: 'reviews', populate: { path: 'author' } });
    if (!farmFound) {
      req.flash('error', 'Questa azienda non ?? pi?? registrata su Cibozero');
      return res.redirect('/produttori');
    }
    res.render('farms/details', { farmFound });
  })
);

// fav routes
router.post('/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);
  const farm = await Farm.findById(id);
  const favorites = user.favorites.indexOf(farm.id);
  if (favorites === -1) {
    user.favorites.push(farm);
    req.flash('success', `${farm.name} ?? stato aggiunto ai preferiti`);
  } else {
    user.favorites.splice(favorites, 1);
    req.flash('success', `${farm.name} ?? stato rimosso dai preferiti`);
  }
  await user.save();
  console.log(user.favorites);
  return res.redirect(`/produttori/${id}`);
});
//------------------------------------------------- MODIFICA DI UN SINGOLO PRODUTTORE TRAMITE ID ----------------------------------------------------------------------------//
router.get(
  '/:id/modifica',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    if (!farm) {
      req.flash('error', 'Questa azienda non ?? pi?? registrata su Cibozero');
      res.redirect('/produttori');
    }
    res.render('farms/edit', { farm, country });
  })
);
router.patch(
  '/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { city, district, country, CAP } = req.body;
    const geodata = await geocoder
      .forwardGeocode({
        query: `${city},${district},${country},${CAP}`,
        limit: 1,
      })
      .send();
    const farmed = await Farm.findByIdAndUpdate(id, req.body, {
      runValidators: true,
    });
    farmed.geometry = geodata.body.features[0].geometry;
    await farmed.save();
    res.redirect(`/produttori/${farmed._id}`);
  })
);
//------------------------------------------------- CREAZIONE DI UN PRODOTTO ALL'INTERNO DI UN AZIENDA  ----------------------------------------------------------------------------//
router.get(
  '/:id/prodotto/nuovo',
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', { categories, farm });
  })
);
router.post(
  '/:id/prodotti',
  isLoggedIn,
  isOwner,
  upload.single('image'),
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category, stock } = req.body;
    const product = new Product({ name, price, category, stock });
    farm.products.push(product);
    product.farm = farm;
    const { path, filename } = req.file;
    product.image = { url: path, filename: filename };
    await farm.save();
    await product.save();
    req.flash('success', `${product.name} aggiunto con successo!!!`);
    res.redirect(`/produttori/${farm._id}`);
    console.log(product._id);
  })
);
//------------------------------------------------- ELIMINAZIONE DI UN SINGOLO PRODUTTORE ----------------------------------------------------------------------------//
router.delete(
  '/:id',
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farmDeleted = await Farm.findByIdAndDelete(id).populate('products');
    // destroy this Farm in favourites
    const user = await User.find({ favorites: { $in: id } });
    if (user) {
      user.forEach((u) => {
        const finder = u.favorites.indexOf(farmDeleted.id);
        const deleted = u.favorites.splice(finder, 1);
        u.save();
      });
      req.flash(
        'success',
        'Hai annullato correttamente la tua iscrizione a Cibozero'
      );
      return res.redirect('/produttori');
    } else {
      req.flash(
        'success',
        'Hai annullato correttamente la tua iscrizione a Cibozero'
      );
      return res.redirect('/produttori');
    }
  })
);

module.exports = router;
