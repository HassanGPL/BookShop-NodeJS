const getDb = require('../utils/database').getDb;
const mongodb = require('mongodb');

class Product {
    constructor(title, price, description, imageUrl, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
            dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this });
        } else {
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => console.log(err));
    }

    static findById(productId) {
        const db = getDb();
        const id = new mongodb.ObjectId(productId);
        return db.collection('products')
            .find({ _id: id })
            .next()
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => console.log(err));
    }

    static deleteById(productId) {
        const db = getDb();
        const id = new mongodb.ObjectId(productId);
        return db.collection('products')
            .deleteOne({ _id: id })
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }
}

module.exports = Product;