const express = require('express');
const storeRouter = express.Router()

const storeController = require("../controllers/storeController")
const bookingController = require("../controllers/bookingController")

const isLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect("/login?message=auth");
    }
}

storeRouter.get("/", storeController.getIndex)
storeRouter.get("/homes", storeController.getHomes)
storeRouter.get("/favourites", isLoggedIn, storeController.getFavourites)

storeRouter.get("/bookings", isLoggedIn, bookingController.getMyBookings)
storeRouter.get("/homes/:homeId/book", isLoggedIn, bookingController.getBookingForm)
storeRouter.post("/bookings", isLoggedIn, bookingController.postBooking)

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", isLoggedIn, storeController.postAddToFavourite)
storeRouter.post("/favourites/delete/:homeId", isLoggedIn, storeController.postRemoveFromFavourite)
storeRouter.post("/bookings/delete/:bookingId", isLoggedIn, bookingController.deleteBooking)

module.exports = storeRouter;