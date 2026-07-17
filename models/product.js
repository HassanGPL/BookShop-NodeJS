const fs = require('fs');
const path = require('path');
const util = require('../utils/path');

const Cart = require('./cart');

const p = path.join(util, 'data', 'products.json');
const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, data) => {
        if (err) {
            return cb([]);
        }
        cb(JSON.parse(data));
    })
}


module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                products[existingProductIndex] = this;
            } else {
                this.id = Math.random().toString();
                products.push(this);
            }
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err);
            });
        })
    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const updatedProducts = products.filter(prod => prod.id !== id);
            const product = products.find(prod => prod.id === id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb)
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === id);
            cb(product);
        });
    }
}