const Homestay = require("../models/homestay");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
    Homestay.find().then(registeredHomes => {
        res.render('store/index', {
            registeredHomes: registeredHomes,
            pageTitle: 'Homestay Booking System',
            currentPage: 'index',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/404');
    });
}

exports.getHomes = (req, res, next) => {
    Homestay.find().then(registeredHomes => {
        res.render('store/homes', {
            registeredHomes: registeredHomes,
            pageTitle: 'All Homestays',
            currentPage: 'homes',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/404');
    });
}

exports.getFavourites = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId).populate('favourites');
        res.render('store/favourites', {
            favouriteHomes: user.favourites,
            pageTitle: 'My Favourites',
            currentPage: 'favourites',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
}

exports.postAddToFavourite = async (req, res, next) => {
    try {
        const homeId = req.body.id;
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        if (!user.favourites.some(fav => fav.toString() === homeId)){
            user.favourites.push(homeId);
            await user.save();
        }
        res.redirect("/favourites");
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

exports.postRemoveFromFavourite = async (req, res, next) => {
    try {
        const homeId = req.params.homeId;
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        if (user.favourites.some(fav => fav.toString() === homeId)){
            user.favourites = user.favourites.filter(fav => fav.toString() !== homeId);
            await user.save();
        }
        res.redirect("/favourites");
    } catch (err) {
        console.log(err);
        res.redirect('/favourites');
    }
}

exports.getHomeDetails = (req, res, next) => {
    const homeId = req.params.homeId;
    Homestay.findById(homeId).then(home => {
        if (!home) {   
            return res.redirect("/homes");
        }              
        res.render('store/home-details', {
            home: home,                     
            pageTitle: 'Homestay Details',
            currentPage: 'homes',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    }).catch(err => {
        console.log(err);
        res.redirect("/homes");
    });
}