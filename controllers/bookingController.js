const Homestay = require("../models/homestay");
const Booking = require("../models/booking");

exports.getBookingForm = async (req, res, next) => {
    const homeId = req.params.homeId;
    try {
        const home = await Homestay.findById(homeId);
        if (!home) {
            return res.redirect("/homes");
        }
        res.render('store/booking-form', {
            home: home,
            pageTitle: 'Book Homestay',
            currentPage: 'bookings',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    } catch (err) {
        console.log(err);
        res.redirect("/homes");
    }
}

exports.postBooking = async (req, res, next) => {
    const { homeId, checkIn, checkOut, guests, totalPrice } = req.body;
    const userId = req.session.user._id;
    
    try {
        const booking = new Booking({
            homeId: homeId,
            userId: userId,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            totalPrice: totalPrice,
        });
        await booking.save();
        res.redirect("/bookings");
    } catch (err) {
        console.log(err);
        res.redirect("/homes/" + homeId);
    }
}

exports.getMyBookings = async (req, res, next) => {
    const userId = req.session.user._id;
    try {
        const bookings = await Booking.find({ userId: userId }).populate('homeId');
        res.render('store/bookings', {
            bookings: bookings,
            pageTitle: 'My Bookings',
            currentPage: 'bookings',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
}

exports.deleteBooking = async (req, res, next) => {
    const bookingId = req.params.bookingId;
    try {
        await Booking.findByIdAndDelete(bookingId);
        res.redirect("/bookings");
    } catch (err) {
        console.log(err);
        res.redirect("/bookings");
    }
}