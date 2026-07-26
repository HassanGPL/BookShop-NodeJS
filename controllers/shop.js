const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/index', {
                products: products,
                pageTitle: "Shop",
                path: '/',
            });
        })
        .catch(err => console.log(err));
}


exports.getProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.render('shop/product-list', {
                products: products,
                pageTitle: "All Products",
                path: '/products',
            });
        }).catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findByPk(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        }).catch(err => console.log(err));
}


exports.getCart = (req, res, next) => {
    const user = req.user;
    user.getCart()
        .then(cart => {
            return cart.getProducts();
        })
        .then(products => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Cart',
                products: products
            });
        })
        .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    const user = req.user;
    let fetchedCart;
    let newQuantity;
    user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        }).then(products => {
            let product;
            if (products.length > 0) {
                product = products[0]
            }
            if (product) {
                //....
            }
            return Product.findByPk(productId);
        }).then(product => {
            newQuantity = 1;
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
        }).then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Orders'
    });
}

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        const productPrice = product.price;
        Cart.deleteProduct(productId, productPrice)
        res.redirect('/cart');
    });
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}