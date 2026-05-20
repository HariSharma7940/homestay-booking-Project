const Home = require("../models/home");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
    console.log("Session Value: ", req.session);
    Home.find().then(registeredHomes => {
        res.render('store/index', {
            registeredHomes: registeredHomes,
            pageTitle: 'Airbnb Home',
            currentPage: 'index',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    })
}

exports.getHomes = (req, res, next) => {
    Home.find().then(registeredHomes => {
        res.render('store/home-list', {
            registeredHomes: registeredHomes,
            pageTitle: 'Homes List',
            currentPage: 'home',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    })
}

exports.getBookings = (req, res, next) => {
    res.render('store/bookings', {
        pageTitle: 'My Bookings',
        currentPage: 'bookings',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
    });
}

exports.getFavourites = async (req, res, next) => {
    const userId = req.session.user._id;
    console.log("USER ID FROM SESSION:", userId);  // ← add this
    const user = await User.findById(userId).populate('favourites');
    console.log("USER FROM DB:", user);             // ← add this too
    res.render('store/favourite-list', {
        favouriteHomes: user.favourites,
        pageTitle: 'My Favourites',
        currentPage: 'favourites',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
    });
}

exports.postAddToFavourite = async (req, res, next) => {
    const homeId = req.body.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (!user.favourites.some(fav => fav.toString() === homeId)){
        user.favourites.push(homeId);
        await user.save();
    }
    res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (user.favourites.some(fav => fav.toString() === homeId)){
    user.favourites = user.favourites.filter(fav => fav.toString() !== homeId);
        await user.save();
    }
    res.redirect("/favourites")
}

exports.getHomeDetails = (req, res, next) => {
    const homeId = req.params.homeId;
    Home.findById(homeId).then(home => {
        if (!home || home.length === 0) {   
            console.log("Home not found");
            return res.redirect("/homes");
        }              
        console.log(home);
        res.render('store/home-details', {
            home: home,                     
            pageTitle: 'Home Details',
            currentPage: 'Home',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user,
        });
    })
}