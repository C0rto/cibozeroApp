const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../helpers/catchAsync');
const ExpressError = require('../helpers/ExpressError');
const { isLoggedIn, isReviewAuthor } = require('../middleware');
const Farm = require('../models/farm');
const Review = require('../models/reviews');
const { reviewSchema } = require('../schemas/validateSchemas');
// ---------------------------------------------------------
const validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errorMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(errorMsg, 400);
  } else {
    next();
  }
};
// ---------------------------------------------------------
router.post(
  '/',
  validateReviews,
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const review = new Review(req.body);
    review.author = req.user._id;
    farm.reviews.push(review);
    await review.save();
    await farm.save();
    req.flash('success', 'Nuova recensione pubblicata su Cibozero');
    res.redirect(`/produttori/${farm._id}`);
  })
);
router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const farm = await Farm.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Recensione eliminata con successo');
    res.redirect(`/produttori/${id}`);
  })
);

module.exports = router;
