const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');
const Farm = require('../models/farm');
const { farmSchema } = require('../schemas/validateSchemas');
const { isLoggedIn } = require('../middleware');
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
router.get('/scopricibozero', (req, res) => {
  res.render('cibozero');
});
// route di ragisrazione vednitore

// Modulo di registrazione per aziende
router.get('/registrazione', isLoggedIn, (req, res) => {
  res.render('farms/new', { country });
});
// Post della registrazione sulla pagina dei produttori
router.post(
  '/produttori',
  validateFarm,
  catchAsync(async (req, res, next) => {
    const newFarm = new Farm(req.body);
    await newFarm.save();
    req.flash('success', 'Ti diamo ufficialmente il benvenuto su cibozero');
    res.redirect('/produttori');
  })
);
// -----------------------------------------------------------

module.exports = router;
