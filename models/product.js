const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);

// const getDb = require('../utils/database').getDb;
// const mongodb = require('mongodb');

// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let dbOp;
//         if (this._id) {
//             dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this });
//         } else {
//             dbOp = db.collection('products').insertOne(this);
//         }
//         return dbOp
//             .then(result => console.log(result))
//             .catch(err => console.log(err));
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 console.log(products);
//                 return products;
//             })
//             .catch(err => console.log(err));
//     }

//     static findById(productId) {
//         const db = getDb();
//         const id = new mongodb.ObjectId(productId);
//         return db.collection('products')
//             .findOne({ _id: id })
//             .then(product => {
//                 console.log(product);
//                 return product;
//             })
//             .catch(err => console.log(err));
//     }

//     static deleteById(productId) {
//         const db = getDb();
//         const id = new mongodb.ObjectId(productId);
//         return db.collection('products')
//             .deleteOne({ _id: id })
//             .then(result => console.log(result))
//             .catch(err => console.log(err));
//     }
// }

// module.exports = Product;