const express = require('express');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const passport = require('passport');
const Farm = require('../models/farm');
const User = require('../models/user');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { isLoggedIn } = require('../middleware');

//------------------------------------------------- MONGOOSE ----------------------------------------------------------------------------//

const mongoose = require('mongoose');

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
      const { username, email, password, city } = req.body;
      const geodata = await geocoder
        .forwardGeocode({
          query: `${city}`,
          limit: 1,
        })
        .send();
      const user = new User({
        email,
        username,
        city,
        geometry: geodata.body.features[0].geometry,
      });
      const newUser = await User.register(user, password);
      req.login(newUser, (e) => {
        if (e) return next(e);
        req.flash('success', 'Benvenuto su Cibozero');
        res.redirect('/');
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
    req.flash('welcome', 'Bentornato su Cibozero');
    // req.session.returnTo || to add for a redirect in function of previus visit
    const redirectUrl = '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

//------------------------------------------------- PRODUTTORI IN ZONA PER UTENTE ----------------------------------------------------------------------------//

router.get('/', isLoggedIn, async (req, res) => {
  const farms = await db
    .collection('farms')
    .aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: req.user.geometry.coordinates },
          distanceField: 'dist.calculated',
          maxDistance: 100000,
          spherical: true,
        },
      },
    ])
    .toArray();
  res.render('farms/index', { farms });
});

// to use phone --------------

//------------------------------------------------- LOGOUT DI UN SINGOLO UTENTE ----------------------------------------------------------------------------//
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Perfetto adesso sei scollegato');
  res.redirect('/');
});

//------------------------------------------------- RICERCA POSIZIONE DELL'UTENTE ----------------------------------------------------------------------------//
router.get('/cercaintorno', isLoggedIn, async (req, res) => {
  const farms = await Farm.find({});
  res.render('cercaIntorno', { farms });
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
    // take the position and set it to the user
    const userPos = await User.findById(req.user._id);
    userPos.geometry = geodata.body.features[0].geometry;
    await userPos.save();
    // save the position to the user geometry
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
        'Mi dispiace, non ci sono ancora produttori nella tua zona!!! Ti mostriamo quelli più vicini'
      );
      return res.redirect('/produttori');
    } else {
      res.render('farms/index', { farms });
    }
  }
});

// Fav Path to add a farm to user's fav point
router.get('/favorites', isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user.id);
  const farms = await Farm.find({ _id: { $in: user.favorites } });
  if (!user.favorites.length) {
    req.flash('error', 'Non hai ancora preferiti');
    return res.redirect('/');
  } else {
    return res.render('users/favorites', { user, farms });
  }
});

module.exports = router;
