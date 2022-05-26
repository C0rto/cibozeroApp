const Review = require('./models/reviews');
const { farmSchema, reviewSchema } = require('./schemas/validateSchemas');
const ExpressError = require('./helpers/ExpressError');
const Farm = require('./models/farm');
//------------------------------------------------- MIDDLEWARE PER VERIFICARE SE LOGGATO ----------------------------------------------------------------------------//
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Devi accedere');
    return res.redirect('/login');
  }
  next();
};
//------------------------------------------------- MIDDLEWARE PER VERIFICARE SE HA SCRITTO LA RECENSION E PER VALIDARLA ----------------------------------------------------------------------------//
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'Non hai i permessi per eliminare questa recensione');
    return res.redirect(`/produttori/${id}`);
  }
  next();
};
module.exports.validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errorMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};
//------------------------------------------------- MIDDLEWARE PER VERIFICARE SE SI é PROPRIETARI E PER VALIDARE L'AZIENDA ----------------------------------------------------------------------------//
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  if (!farm.owner.equals(req.user._id)) {
    req.flash('error', 'Non hai i permessi per fare ciò!');
    return res.redirect(`/produttori/${id}`);
  }
  next();
};

module.exports.validateFarm = (req, res, next) => {
  const { error } = farmSchema.validate(req.body);
  if (error) {
    const errorMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};
