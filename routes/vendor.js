const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');
const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');
const { farmSchema } = require('../schemas/validateSchemas');
const passport = require('passport');
// -------------------------------------------------------
const validateFarm = (req, res, next) => {
  const { error } = farmSchema.validate(req.body);
  if (error) {
    const errorMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};
// ----------------------------------------------------------
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
// ----------------------------------------------------------
// Accesso ad info e modulo di registrazione per aziende
router.get('/entraincibozero', (req, res) => {
  res.render('cibozero');
});

// route di ragisrazione venditore
router.get('/nuova', (req, res) => {
  res.render('vendor/register');
});
router.post(
  '/nuova',
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const vendor = new Vendor({ email, username });
      const newVendor = await Vendor.register(vendor, password);
      req.login(newVendor, (e) => {
        if (e) return next(e);
        req.flash('success', 'Bentornato su Cibozero');
        res.redirect('/produttori');
      });
    } catch (e) {
      req.flash('error', e.message);
      res.redirect('/produttori/registrazione/nuova');
    }
  })
);

// -----------------------------------------------------------

module.exports = router;
