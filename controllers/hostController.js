const Homestay = require("../models/homestay");
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