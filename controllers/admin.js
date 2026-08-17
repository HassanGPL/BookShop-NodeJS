const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('admin/products', {
                products: products,
                pageTitle: "Admin Products",
                path: '/admin/products',
            });
        })
        .catch(err => console.log(err));
}

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl
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
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: edit,
                product: product
            });
        }).catch(err => console.log(err));
}

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const userId = req.user._id;
    const product = new Product(title, price, description, imageUrl, productId, userId);
    product.save()
        .then(result => {
            console.log('UPDATED PRODUCT SUCCESSFULLY!');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId)
        .then(() => {
            console.log('DELETED PRODUCT SUCCESSFULLY!')
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}