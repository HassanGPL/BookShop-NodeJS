const Product = require('../models/product');
const { validationResult } = require('express-validator');

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: "Admin Products",
                path: '/admin/products'
            });
        })
        .catch(err => console.log(err));
}

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        oldInput: { title: '', imageUrl: '', price: '', description: '' },
        validationErrors: [],
        errorMessage: null
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            oldInput: { title, imageUrl, price, description },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg
        });
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
    });

    product.save()
        .then(result => {
            console.log('Created Product Successfully!');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}

exports.getEditProduct = (req, res, next) => {
    const edit = req.query.edit;
    if (!edit) {
        return res.redirect('/')
    }
    const productId = req.params.productId;
    Product.findOne({ _id: productId, userId: req.user._id })
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: edit,
                product: product,
                oldInput: {
                    title: product.title,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    description: product.description
                },
                validationErrors: [],
                errorMessage: null
            });
        }).catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);

    Product.findOne({ _id: productId, userId: req.user._id })
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            if (!errors.isEmpty()) {
                return res.status(422).render('admin/edit-product', {
                    pageTitle: "Edit Product",
                    path: "/admin/edit-product",
                    editing: true,
                    product: product,
                    oldInput: { title, imageUrl, price, description },
                    validationErrors: errors.array(),
                    errorMessage: errors.array()[0].msg
                });
            }

            product.title = title;
            product.price = price;
            product.description = description;
            product.imageUrl = imageUrl;
            return product.save()
                .then(() => {
                    console.log('UPDATED PRODUCT SUCCESSFULLY!');
                    res.redirect('/admin/products');
                });
        })
        .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({ _id: productId, userId: req.user._id })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.redirect('/');
            }
            console.log('DELETED PRODUCT SUCCESSFULLY!')
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}