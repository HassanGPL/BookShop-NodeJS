const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

// const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//     User.findById('6a78fbec20e75765bc03dbc2')
//         .then(user => {
//             req.user = new User(user.name, user.email, user.cart, user._id);
//             next();
//         })
//         .catch(err => console.log(err));
// })

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
    .connect('mongodb+srv://hassanahmed11920_db_user:Jtzabjwln4UxfuJF@cluster0.bbisxfp.mongodb.net/shop?appName=Cluster0')
    .then(result => {
        console.log('Database Connected!');
        app.listen(3000);
    })
    .catch(err => console.log(err));
