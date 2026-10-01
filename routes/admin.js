const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const productValidators = [
    check('title').trim().notEmpty().withMessage('Title is required'),
    check('imageUrl').isURL().withMessage('Please enter a valid image URL'),
    check('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
    check('description').trim().notEmpty().withMessage('Description is required')
];

router.use(isAuth);

// /admin/products //GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product //GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product //POST
router.post('/add-product', isAuth, ...productValidators,
    adminController.postAddProduct);

// /admin/edit-product/productId?edit=true //GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product //POST
router.post('/edit-product', isAuth, ...productValidators, adminController.postEditProduct);

// /admin/delete-product //POST
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;