const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const Farm = require('../models/farm');
const Product = require('../models/products');
const { isLoggedIn, isOwner, validateFarm } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });
const { categories, country } = require('../helpers/datas');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
//------------------------------------------------- INDICE DI TUTTI I PRODUTTORI HOME PAGE PRODUTTORI ----------------------------------------------------------------------------//
router.get(
  '/',
  catchAsync(async (req, res) => {
    // hard function

    // endof
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
      req.flash('error', 'Questa azienda non è più registrata su Cibozero');
      res.redirect('/produttori');
    }
    res.render('farms/details', { farmFound });
  })
);
//------------------------------------------------- MODIFICA DI UN SINGOLO PRODUTTORE TRAMITE ID ----------------------------------------------------------------------------//
router.get(
  '/:id/modifica',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    if (!farm) {
      req.flash('error', 'Questa azienda non è più registrata su Cibozero');
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
    farmed.location = geodata.body.features[0].geometry;
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
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category });
    farm.products.push(product);
    product.farm = farm;
    const { path, filename } = req.file;
    product.image = { url: path, filename: filename };
    await farm.save();
    await product.save();
    req.flash('success', `${product.name} aggiunto con successo!!!`);
    res.redirect(`/produttori/${farm._id}`);
  })
);
//------------------------------------------------- ELIMINAZIONE DI UN SINGOLO PRODUTTORE ----------------------------------------------------------------------------//
router.delete(
  '/:id',
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farmDeleted = await Farm.findByIdAndDelete(id);
    req.flash(
      'success',
      'Hai annullato correttamente la tua iscrizione a Cibozero'
    );
    res.redirect('/produttori');
  })
);

module.exports = router;
