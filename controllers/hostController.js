const Homestay = require("../models/homestay");
const Booking = require("../models/booking");
const fs = require("fs");

exports.getAddHome = (req, res, next) => {
    res.render('host/add-home', {
        pageTitle: 'Add Homestay',
        currentPage: 'addHome',
        user: req.session.user,
        isLoggedIn: req.isLoggedIn
    });
}

exports.getEditHome = (req, res, next) => {
    const homeId = req.params.homeId;

    Homestay.findById(homeId).then(home => {
        if (!home) {
            console.log("Homestay not found for editing.");
            return res.redirect("/host/host-home-list");
        }
        res.render('host/edit-home', {
            home: home,
            pageTitle: 'Edit Homestay',
            currentPage: 'host-homes',
            user: req.session.user,
            isLoggedIn: req.isLoggedIn
        });
    }).catch(err => {
        console.log(err);
        res.redirect("/host/host-home-list");
    });
}

exports.getHostHomes = (req, res, next) => {
    // Only fetch homestays created by the logged in host
    Homestay.find({ hostId: req.session.user._id }).then(registeredHomes => {
        res.render('host/host-home-list', {
            registeredHomes: registeredHomes,
            pageTitle: 'Host Dashboard',
            currentPage: 'host-homes',
            user: req.session.user,
            isLoggedIn: req.isLoggedIn
        });
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    });
}

exports.postAddHome = (req, res, next) => {
    const { houseName, price, location, rating, description, guests, bedrooms, bathrooms } = req.body;
    const amenities = req.body.amenities ? [].concat(req.body.amenities) : [];

    if (!req.file){
        return res.status(422).send("No image provided.");
    }
    const photo = '/' + req.file.path.replace(/\\/g, '/');

    const homestay = new Homestay({
        houseName, 
        price, 
        location, 
        rating, 
        photo, 
        description,
        guests,
        bedrooms,
        bathrooms,
        amenities,
        hostId: req.session.user._id // reference to User who is host
    });

    homestay.save()
        .then(() => {
            console.log("Homestay Saved Successfully.");
            res.redirect('/host/host-home-list');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/host/add-home');
        });
}

exports.postEditHome = (req, res, next) => {
    const { id, houseName, price, location, rating, description, guests, bedrooms, bathrooms } = req.body;
    const amenities = req.body.amenities ? [].concat(req.body.amenities) : [];

    Homestay.findById(id).then((home) => {
        if (!home) {
            return res.redirect('/host/host-home-list');
        }
        
        home.houseName = houseName;
        home.price = price;
        home.location = location;
        home.rating = rating;      
        home.description = description;
        home.guests = guests;
        home.bedrooms = bedrooms;
        home.bathrooms = bathrooms;
        home.amenities = amenities;

        if (req.file){
            // Delete old photo file
            fs.unlink('.' + home.photo, (err) => {
                if (err) {
                    console.log("Error while deleting file", err);
                }                
            });
            home.photo = '/' + req.file.path.replace(/\\/g, '/');
        }

        return home.save();
    })
    .then(result => {
        console.log("Homestay Updated");
        res.redirect('/host/host-home-list');
    })
    .catch(err => {
        console.log("Error While Updating ", err);
        res.redirect('/host/host-home-list');
    });
}

exports.postDeleteHome = (req, res, next) => {
    const homeId = req.params.homeId;
    
    Homestay.findById(homeId)
        .then(home => {
            if (home && home.photo) {
                fs.unlink('.' + home.photo, (err) => {
                    if (err) {
                        console.log("Error deleting photo", err);
                    }
                });
            }
            return Homestay.findByIdAndDelete(homeId);
        })
        .then(() => {
            res.redirect('/host/host-home-list');
        })
        .catch(error => {
            console.log("Error While Deleting ", error);
            res.redirect('/host/host-home-list');
        });
}

exports.getHostBookings = async (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'host') {
        return res.redirect("/");
    }

    try {
        const myHomes = await Homestay.find({ hostId: req.session.user._id });
        const myHomeIds = myHomes.map(home => home._id);

        const bookings = await Booking.find({ homeId: { $in: myHomeIds } })
            .populate('homeId')
            .populate('userId')
            .sort({ checkIn: -1 });

        res.render('host/manage-bookings', {
            bookings: bookings,
            pageTitle: 'Manage Bookings',
            currentPage: 'host-bookings',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    } catch (err) {
        console.log("Error in getHostBookings: ", err);
        res.redirect("/");
    }
}

exports.postApproveBooking = async (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'host') {
        return res.redirect("/");
    }

    const bookingId = req.params.bookingId;
    try {
        const booking = await Booking.findById(bookingId).populate('homeId');
        if (!booking) {
            console.log("Booking not found");
            return res.redirect("/host-bookings");
        }

        if (booking.homeId.hostId.toString() !== req.session.user._id.toString()) {
            console.log("Unauthorized host access to booking");
            return res.redirect("/host-bookings");
        }

        booking.status = 'Approved';
        booking.approvedAt = new Date();
        booking.approvedBy = req.session.user._id;

        await booking.save();
        res.redirect("/host-bookings");
    } catch (err) {
        console.log("Error in postApproveBooking: ", err);
        res.redirect("/host-bookings");
    }
}

exports.postRejectBooking = async (req, res, next) => {
    if (!req.session.user || req.session.user.userType !== 'host') {
        return res.redirect("/");
    }

    const bookingId = req.params.bookingId;
    const { rejectionReason } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('homeId');
        if (!booking) {
            console.log("Booking not found");
            return res.redirect("/host-bookings");
        }

        if (booking.homeId.hostId.toString() !== req.session.user._id.toString()) {
            console.log("Unauthorized host access to booking");
            return res.redirect("/host-bookings");
        }

        booking.status = 'Rejected';
        booking.rejectedAt = new Date();
        booking.rejectionReason = rejectionReason ? rejectionReason.trim() : 'No reason provided';

        await booking.save();
        res.redirect("/host-bookings");
    } catch (err) {
        console.log("Error in postRejectBooking: ", err);
        res.redirect("/host-bookings");
    }
}