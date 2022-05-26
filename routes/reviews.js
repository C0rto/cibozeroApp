const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../helpers/catchAsync');
const {
  isLoggedIn,
  isReviewAuthor,
  validateReviews,
} = require('../middleware');
const Farm = require('../models/farm');
const Review = require('../models/reviews');
//------------------------------------------------- AGGIUNTA DI UNA NUOVA RECENSIONE SUL SINGOLO VENDITORE ----------------------------------------------------------------------------//
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
//------------------------------------------------- ELIMINAZIONE DI UNA SINGOLA RECENSIONE ----------------------------------------------------------------------------//
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
    return res.redirect(`/produttori/${id}`);
  })
);

module.exports = router;
