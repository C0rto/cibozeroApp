const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// --------------------------------------------------

const User = require('./models/user');

// ----------------------------------------------------------------

const ExpressError = require('./helpers/ExpressError');

// -----------------------------------------------------------------

const farmRoute = require('./routes/farm');
const productRoute = require('./routes/products');
const reviewRoute = require('./routes/reviews');
const userRoute = require('./routes/user');
const vendorRoute = require('./routes/vendor');
// --------------------------------------------------------

mongoose.connect('mongodb://localhost:27017/cibozerodataprova');
const db = mongoose.connection;
db.on('Error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected');
});

// -------------------------------------------------

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------------------------------------

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------

const sessionConfig = {
  secret: 'I4mDumb',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// -------------------------------
// PASSPORT SECTION passport ha bisogno di essere inizializzato, di inizializzare la sessione
app.use(passport.initialize());
app.use(passport.session());
// questa è la strategia per usare passport sull'utente
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// -------------------------------
// app.use intercetta tutte le richieste e risponde a tutte, ci permette di impostare un middleware di locals, che permette di accedere a moduli all'interno delle routes
app.use((req, res, next) => {
  // se req.originalUrl non include i path login o la home allora reindirizza la sessione a req.originalUrl,
  if (!['/login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
// -------------------------------
// -------------------------------
// Routing Produttori
app.use('/produttori', farmRoute);
// Routing Recensioni
app.use('/produttori/:id/recensione', reviewRoute);
// Routing Prodotti
app.use('/prodotti', productRoute);
// Routing Registrazione Utente
app.use('/', userRoute);
// Routing Home
app.get('/', (req, res) => {
  res.render('home');
});

// Routing registrazione Produttori
//
app.use('/', vendorRoute);
// Routing 404
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});
// middleware error
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Damn an Error!!!';
  res.status(statusCode).render('error', { err });
});
// listening
app.listen(8080, () => {
  console.log('Ok Buddy I am online on port 8080!!!');
});
