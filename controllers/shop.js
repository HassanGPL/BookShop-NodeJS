const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                products: products,
                pageTitle: "Shop",
                path: '/',
                isLoggedIn: req.loggedIn
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
                isLoggedIn: req.loggedIn
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
                path: '/products',
                isLoggedIn: req.loggedIn
            });
        }).catch(err => console.log(err));
}


exports.getCart = (req, res, next) => {
    const user = req.user;
    user.getCart()
        .then(products => {
            const calculatedTotal = products.reduce((total, product) => {
                return total + product.price * product.quantity;
            }, 0);
            const totalPrice = Number(calculatedTotal.toFixed(2));

            if (user.cart.totalPrice !== totalPrice) {
                user.cart.totalPrice = totalPrice;
                return user.save().then(() => ({ products, totalPrice }));
            }

            return { products, totalPrice };
        })
        .then(({ products, totalPrice }) => {

            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Cart',
                products: products,
                totalPrice: totalPrice,
                isLoggedIn: req.loggedIn
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
    const cartItems = user.cart.items;

    if (cartItems.length === 0) {
        return res.redirect('/cart');
    }

    Product.find({ _id: { $in: cartItems.map(item => item.productId) } })
        .lean()
        .then(productDocuments => {
            const productMap = new Map(productDocuments.map(product => {
                return [product._id.toString(), product];
            }));
            const products = cartItems
                .filter(item => productMap.has(item.productId.toString()))
                .map(item => ({
                    product: productMap.get(item.productId.toString()),
                    quantity: item.quantity
                }));

            if (products.length === 0) {
                    res.redirect('/cart');
                    return null;
            }

            const order = new Order({
                products: products,
                user: {
                    userId: user._id,
                    name: user.name
                }
            })

            return order.save();
        })
        .then(order => {
            if (!order) {
                return null;
            }

            return User.updateOne(
                { _id: user._id },
                { $set: { 'cart.items': [], 'cart.totalPrice': 0 } }
            );
        })
        .then(result => {
            if (result) {
                res.redirect('/orders');
            }
        })
        .catch(err => next(err));
}

exports.getOrders = (req, res, next) => {
    const user = req.user;
    Order
        .find({ 'user.userId': user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders,
                isLoggedIn: req.loggedIn
            });
        }).catch(err => console.log(err));
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     })
// }