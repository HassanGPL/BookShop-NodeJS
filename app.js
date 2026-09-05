const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);

const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');

const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://hassanahmed11920_db_user:Jtzabjwln4UxfuJF@cluster0.bbisxfp.mongodb.net/shop?appName=Cluster0';

const app = express();
const store = new mongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'session',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14
    }
}));

app.use((req, res, next) => {
    req.loggedIn = req.session.loggedIn === true;
    res.locals.isLoggedIn = req.loggedIn;
    next();
});

app.use((req, res, next) => {
    User.findById('6a8484df24be51541680461b')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Hassan',
                    email: 'hassan@test.com',
                    cart: {
                        items: []
                    }
                })
                user.save()
            }
        })
        console.log('Database Connected!');
        app.listen(3000);
    })
    .catch(err => console.log(err));
