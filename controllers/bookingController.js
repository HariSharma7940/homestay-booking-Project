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
    const { homeId, checkIn, checkOut, guests, paymentMethod, advanceAmount } = req.body;
    const userId = req.session.user._id;
    
    try {
        const home = await Homestay.findById(homeId);
        if (!home) {
            return res.redirect("/homes");
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        let nights = 0;
        if (checkOutDate > checkInDate) {
            const diffTime = Math.abs(checkOutDate - checkInDate);
            nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const guestsCount = parseInt(guests) || 1;
        const calculatedTotalPrice = home.price * guestsCount * nights;
        const parsedAdvanceAmount = parseFloat(advanceAmount) || 0;
        const remainingAmount = calculatedTotalPrice - parsedAdvanceAmount;

        const booking = new Booking({
            homeId: homeId,
            userId: userId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guestsCount,
            totalPrice: calculatedTotalPrice,
            paymentMethod: paymentMethod,
            advanceAmount: parsedAdvanceAmount,
            remainingAmount: remainingAmount >= 0 ? remainingAmount : 0,
            status: 'Pending Owner Approval'
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
        const booking = await Booking.findById(bookingId);
        if (booking) {
            booking.status = 'Cancelled';
            await booking.save();
        }
        res.redirect("/bookings");
    } catch (err) {
        console.log(err);
        res.redirect("/bookings");
    }
}