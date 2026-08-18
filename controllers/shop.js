const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
    Product.find()
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
    Product.find()
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
    Product.findOne({ _id: productId })
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
    Product.findById(productId)
        .then(product => {
            return user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        }).catch(err => console.log(err));
}

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;
    const user = req.user;
    user.deleteItemFromCart(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
}

exports.postOrder = (req, res, next) => {
    const user = req.user;
    user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(p => {
                return {
                    product: { ...p.productId._doc },
                    quantity: p.quantity
                }
            });

            const order = new Order({
                products: products,
                user: {
                    userId: user,
                    name: user.name
                }
            })

            return order.save();
        })
        .then(() => user.clearCart())
        .then(() => res.redirect('/orders'))
        .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
    const user = req.user;
    user.getOrders()
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders
            });
        }).catch(err => console.log(err));
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     })
// }