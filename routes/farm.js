const express = require("express");
const router = express.Router();
const catchAsync = require("../helpers/catchAsync");
const Farm = require("../models/farm");
const Product = require("../models/products");
const { isLoggedIn, isOwner, validateFarm } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });
const { categories, country } = require("../helpers/datas");

// Produttori Indice---------------------------------------------------
router.get(
  "/",
  catchAsync(async (req, res) => {
    const farms = await Farm.find({});
    res.render("farms/index", { farms });
  })
);
// Modulo di registrazione produttore-------------------------------------------------------------
router.get("/registrazione", isLoggedIn, (req, res) => {
  res.render("farms/new", { country });
});
router.post(
  "/",
  isLoggedIn,
  validateFarm,
  catchAsync(async (req, res, next) => {
    const newFarm = new Farm(req.body);
    newFarm.owner = req.user._id;
    await newFarm.save();
    req.flash("success", "Ti diamo ufficialmente il benvenuto su cibozero");
    res.redirect("/produttori");
  })
);
// Mostra singolo Produttore-------------------------------------------
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farmFound = await Farm.findById(id)
      .populate("products")
      .populate("owner")
      .populate({ path: "reviews", populate: { path: "author" } });
    if (!farmFound) {
      req.flash("error", "Questa azienda non è più registrata su Cibozero");
      res.redirect("/produttori");
    }
    res.render("farms/details", { farmFound });
  })
);
// Modifica singolo Produttore
router.get(
  "/:id/modifica",
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    if (!farm) {
      req.flash("error", "Questa azienda non è più registrata su Cibozero");
      res.redirect("/produttori");
    }
    res.render("farms/edit", { farm, country });
  })
);
router.patch(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farmed = await Farm.findByIdAndUpdate(id, req.body, {
      runValidators: true,
    });
    res.redirect(`/produttori/${farmed._id}`);
  })
);
// Crea Prodotto per un singolo produttore
router.get(
  "/:id/prodotto/nuovo",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render("products/new", { categories, farm });
  })
);
router.post(
  "/:id/prodotti",
  upload.single("image"),
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category } = req.body;

    const product = new Product({ name, price, category });
    farm.products.push(product);
    product.farm = farm;
    const { path, filename } = req.file;
    product.image = [{ url: path, filename: filename }];
    await farm.save();
    await product.save();
    console.log(product);
    req.flash("success", `${product.name} aggiunto con successo!!!`);
    res.redirect(`/produttori/${farm._id}`);
  })
);
// Elimina Produttore
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farmDeleted = await Farm.findByIdAndDelete(id);
    req.flash(
      "success",
      "Hai annullato correttamente la tua iscrizione a Cibozero"
    );
    res.redirect("/produttori");
  })
);

module.exports = router;
