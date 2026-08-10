const getDb = require('../utils/database').getDb;
const mongodb = require('mongodb');

class User {
    constructor(username, email, cart, _id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = _id;
    }

    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this)
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    addToCart(product) {
        const productId = new mongodb.ObjectId(product._id);
        const userId = new mongodb.ObjectId(this._id);

        const cartProductIndex = this.cart.items.findIndex(p => {
            return p.productId.toString() === productId.toString();
        });

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: productId, quantity: newQuantity })
        }

        const updatedCart = { items: updatedCartItems };

        const db = getDb();
        return db.collection('users')
            .updateOne({ _id: userId },
                { $set: { cart: updatedCart } });
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(p => {
            return p.productId;
        })

        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        quantity: this.cart.items.find(i => {
                            return i.productId.toString() === product._id.toString();
                        }).quantity
                    }
                })
            })
    }

    deleteItemFromCart(productId) {
        const userId = new mongodb.ObjectId(this._id);

        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });

        const db = getDb();
        return db.collection('users')
            .updateOne({ _id: userId },
                { $set: { cart: { items: updatedCartItems } } });
    }

    static findById(userId) {
        const db = getDb();
        const id = new mongodb.ObjectId(userId);
        return db.collection('users')
            .findOne({ _id: id })
            .then(user => {
                console.log(user);
                return user;
            }).catch(err => console.log(err));
    }
}

module.exports = User;