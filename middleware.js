const Review = require('./models/reviews');
const ExpressError = require('./helpers/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Devi accedere');
    return res.redirect('/login');
  }
  next();
};

module.exports.isVendor = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Devi Accedere alla Dash da produttore');
    return res.redirect('/vendor');
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'Non hai i permessi per eliminare questa recensione');
    return res.redirect(`/produttori/${id}`);
  }
  next();
};
