const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(productsData => {
            const products = productsData[0];
            res.render('shop/index', {
                products: products,
                pageTitle: "Shop",
                path: '/',
            });
        })
        .catch(err => console.log(err));
}


exports.getProducts = (req, res, next) => {
    Product.fetchAll().then(productsData => {
        const products = productsData[0];
        res.render('shop/product-list', {
            products: products,
            pageTitle: "All Products",
            path: '/products',
        });
    }).catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId, product => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    });
}


exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (product of products) {
                const cartProduct = cart.products.find(prod => prod.id === product.id);
                if (cartProduct) {
                    cartProducts.push({ productData: product, qty: cartProduct.qty });
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Cart',
                products: cartProducts
            });
        })
    })
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.addProduct(productId, product.price);
    });
    res.redirect('/cart');
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