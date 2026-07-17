const fs = require('fs');
const path = require('path')
const util = require('../utils/path');

const p = path.join(util, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, data) => {
            let cart = { products: [], totalPrice: 0 }
            if (!err) {
                cart = JSON.parse(data);
            }
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatingProduct;
            if (existingProduct) {
                updatingProduct = { ...existingProduct };
                updatingProduct.qty += 1;
                cart.products[existingProductIndex] = updatingProduct;
            } else {
                updatingProduct = { id: id, qty: 1 };
                cart.products.push(updatingProduct);
            }
            cart.totalPrice += +productPrice;
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            })
        });
    }
}