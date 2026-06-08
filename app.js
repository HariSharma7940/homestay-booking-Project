
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const { default: mongoose } = require('mongoose');
const multer = require('multer');
const DB_PATH = process.env.MONGO_URI;

const errorsControllers = require("./controllers/errors")

const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtils");

const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

const randomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for(let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, randomString(10) + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

const multerOptions = {
    storage, fileFilter
};

app.use(express.urlencoded({ extended: false }));
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')))
app.use("/uploads", express.static(path.join(rootDir, 'uploads')))

app.use(session({
    secret: "Homestay project complete full stack",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: DB_PATH,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false
    }
}));

app.use((req, res, next) => {
    req.isLoggedIn = req.session.isLoggedIn;
    res.locals.isLoggedIn = req.isLoggedIn;
    next();
});

app.use(authRouter);
app.use(storeRouter);

app.use("/host", (req, res, next) => {
    if (req.isLoggedIn){
        next();
    } else {
        res.redirect("/login");
    }
});
app.use("/host", hostRouter);

app.use(errorsControllers.pageNotFound)

const PORT = 3002;

mongoose.connect(DB_PATH).then(() => {
    console.log('Connected to Mongo');
    app.listen(PORT, () => {
        console.log(`Server is running on address http://localhost:${PORT}`);
    });
}).catch(err => {
    console.log('Error While connecting to Mongo: ', err)
})