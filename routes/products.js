const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');
const Farm = require('../models/farm');
const Product = require('../models/products');
// ----------------------------------------------------------
const categories = [
  'Ortofrutta',
  'Carne',
  'Pesce',
  'Salumi e Formaggi',
  'Pasta, Riso, Cereali, Farine',
  'Pane e prodotti da forno',
  'Vino e altre bevande alcoliche',
  'Bevande analcoliche',
  'Altro',
];
const country = [
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
];
// -------------------------------------------------------------------------------------
// Products Routes
router.get(
  '/',
  catchAsync(async (req, res) => {
    const { category } = req.query;
    if (category) {
      const products = await Product.find({ category }).populate(
        'farm',
        'name'
      );
      res.render('products/index', { products, category });
    } else {
      const products = await Product.find({}).populate('farm');
      res.render('products/index', { products, category: 'Tutti' });
    }
  })
);

router.get('/nuovo', (req, res) => {
  res.render('products/new', { categories });
});
router.post('/', async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  req.flash('success', 'Nuovo prodotto aggiunto');
  res.redirect(`/prodotti/${newProduct._id}`);
});

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const productFound = await Product.findById(id).populate('farm', 'name');
    res.render('products/details', { productFound });
  })
);

router.get(
  '/:id/edit',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const productFound = await Product.findById(id);
    res.render('products/edit', { productFound, categories });
  })
);
router.put(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      runValidators: true,
    });
    res.redirect(`/prodotti/${product._id}`);
  })
);

router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const productDeleted = await Product.findByIdAndDelete(id);
    req.flash(
      'success',
      `${productDeleted.name} è stato eliminato con successo!`
    );
    res.redirect('/prodotti');
  })
);

module.exports = router;
