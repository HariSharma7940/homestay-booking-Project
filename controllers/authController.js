const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
    const message = req.query.message || null;
    res.render('auth/login', {
        pageTitle: 'Login - Homestay Booking System',
        currentPage: 'login',
        isLoggedIn: false,
        errors: [],
        oldInput: {email: ""},
        user: {},
        message: message,
    });
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        currentPage: 'signup',
        isLoggedIn: false,
        errors: [],
        oldInput: {firstName: "", lastName: "", email: "", userType: ""},
        user: {},
    })
}

exports.postSignup =[
    check("firstName")
    .trim()
    .isLength({min: 2})
    .withMessage("First name should be at least 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name should contain only alphabets"), 

    check("lastName")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

    check("email")
    .isEmail()
    .withMessage("Please enter a valid Email")
    .normalizeEmail(),

    check("password")
    .isLength({min: 8})
    .withMessage("Password should be atleast 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should be atleast one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should be atleast one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should be atleast one number")
    .matches(/[!@$]/)
    .withMessage("Password should be atleast one special character")
    .trim(),

    check("confirmPassword")
    .trim()
    .custom((value, {req}) =>{
        if (value !== req.body.password){
            throw new Error("Password do not match");
        }
        return true;
    }),

    check("userType")
    .notEmpty()
    .withMessage("Please select the user type")
    .isIn(['guest', 'host'])
    .withMessage("Invalid user type"),

    check("terms")
    .notEmpty()
    .withMessage("Please accept the terms and conditions")
    .custom((value, {req}) =>{
        if (value !== "on"){
            throw new Error("Please accept the terms and conditions");
        }
        return true;
    }),

(req, res, next) => {
    const {firstName, lastName, email, password, userType} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
            pageTitle: "Signup",
            currentPage: "signup",
            isLoggedIn: false,
            errors: errors.array().map(err => err.msg),
            oldInput: {firstName, lastName, email, password, userType},
            user: {},
        });
    }

    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({firstName, lastName, email, password: hashedPassword, userType});
        return user.save();
    })
    .then(() => {
        res.redirect("/login");
    }).catch(err => {
        return res.status(422).render("auth/signup", {
            pageTitle: "Signup",
            currentPage: "signup",
            isLoggedIn: false,
            errors: ["Something went wrong. Please try again."],
            oldInput: {firstName, lastName, email, password, userType},
            user: {},         
        });
    });
}];

exports.postLogin = async (req, res, next) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            errors: ["User does not exist"],
            oldInput: {email},
            user: {},
            message: null,
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            errors: ["Incorrect Password"],
            oldInput: {email},
            user: {},
            message: null,
        });
    };

    req.session.isLoggedIn = true;
    req.session.user = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType
    };
    await req.session.save();

    if (user.userType === 'host') {
        res.redirect('/host/host-home-list');
    } else {
        res.redirect('/');
    }
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() =>{
        res.redirect("/login");
    });
};