const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../helpers/catchAsync');
const Product = require('../models/products');
const { isLoggedIn, isOwner } = require('../middleware');
const { categories, country } = require('../helpers/datas');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });
const { cloudinary } = require('../cloudinary');
//------------------------------------------------- INDICE DI TUTTI I PRODOTTI ----------------------------------------------------------------------------//
router.get(
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
  )
);
//------------------------------------------------- SINGOLO PRODOTTO SPECIFICO TRAMITE ID ----------------------------------------------------------------------------//
router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const productFound = await Product.findById(id).populate('farm', 'name');
    res.render('products/details', { productFound });
  })
);
//------------------------------------------------- MODIFICA DEL SINGOLO PRODOTTO SPECIFICO ----------------------------------------------------------------------------//
router.get(
  '/:id/edit',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const productFound = await Product.findById(id);
    res.render('products/edit', { productFound, categories });
  })
);
router.put(
  '/:id',
  isLoggedIn,
  upload.single('image'),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    // using a single image stored in an object
    const product = await Product.findByIdAndUpdate(id, req.body, {
      runValidators: true,
    });
    if (!req.file) {
      res.redirect(`/prodotti/${product._id}`);
    } else {
      const oldImg = product.image.filename;
      cloudinary.uploader.destroy(oldImg);
      const { path, filename } = req.file;
      product.image = { url: path, filename: filename };
      await product.save();
      res.redirect(`/prodotti/${product._id}`);
    }
  })
);
//------------------------------------------------- CANCELLARE SINGOLO PRODOTTO ----------------------------------------------------------------------------//
router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const productDeleted = await Product.findByIdAndDelete(id);
    await cloudinary.uploader.destroy(productDeleted.image.filename);
    req.flash(
      'success',
      `${productDeleted.name} è stato eliminato con successo!`
    );
    res.redirect('/prodotti');
  })
);

module.exports = router;
