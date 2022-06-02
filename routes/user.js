const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const passport = require('passport');
const Farm = require('../models/farm');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const mongoose = require('mongoose');
const { isLoggedIn } = require('../middleware');

mongoose.connect('mongodb://localhost:27017/123');
const db = mongoose.connection;
db.on('Error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected');
});
//------------------------------------------------- REGISTRAZIONE DI UN SINGOLO UTENTE ----------------------------------------------------------------------------//
router.get('/registrati', (req, res) => {
  res.render('users/register');
});
router.post(
  '/registrati',
  catchAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ email, username });
      const newUser = await User.register(user, password);
      req.login(newUser, (e) => {
        if (e) return next(e);
        req.flash('success', 'Benvenuto su Cibozero');
        res.redirect('/produttori');
      });
    } catch (e) {
      req.flash('error', e.message);
      res.redirect('/registrati');
    }
  })
);
//------------------------------------------------- LOGIN DI UN SINGOLO UTENTE ----------------------------------------------------------------------------//
router.get('/login', (req, res) => {
  res.render('users/login');
});
router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: 'login',
  }),
  (req, res) => {
    req.flash('success', 'Bentornato su Cibozero');
    const redirectUrl = req.session.returnTo || '/produttori';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);
//------------------------------------------------- LOGOUT DI UN SINGOLO UTENTE ----------------------------------------------------------------------------//
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Perfetto adesso sei scollegato');
  res.redirect('/produttori');
});

//------------------------------------------------- RICERCA POSIZIONE DELL'UTENTE ----------------------------------------------------------------------------//
router.get('/cercaintorno', isLoggedIn, async (req, res) => {
  const farms = await Farm.find({});
  res.render('cercaIntorno', { farms });
  console.log(req.user);
});
router.post('/', async (req, res) => {
  const { city, rangeDistance } = req.body;
  if (city) {
    const geodata = await geocoder
      .forwardGeocode({
        query: `${city}`,
        limit: 1,
      })
      .send();
    const locations = geodata.body.features[0].geometry.coordinates;
    const farms = await db
      .collection('farms')
      .aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: locations },
            distanceField: 'dist.calculated',
            maxDistance: parseInt(rangeDistance),
            spherical: true,
          },
        },
      ])
      .toArray();

    if (!farms.length) {
      req.flash(
        'error',
        'Mi dispiace, non ci sono produttori nella tua zona!!!'
      );
      res.redirect('/produttori');
    } else {
      res.render('farms/near', { farms, locations });
      console.log(farms);
    }
  } else {
    res.redirect('/produttori');
  }
});

module.exports = router;
