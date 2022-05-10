const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsync = require('../helpers/catchAsync');
const passport = require('passport');
//------------------------------------------------------------------------
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
//------------------------------------------------------------------------
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
//------------------------------------------------------------------------
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Perfetto adesso sei scollegato');
  res.redirect('/produttori');
});
module.exports = router;
