const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

const PRODUCTS_PER_PAGE = 3;

const renderProductPage = (req, res, next, template, pageTitle, routePath) => {
    const requestedPage = Number(req.query.page);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    Product.countDocuments()
        .then(totalProducts => {
            const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
            const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

            return Product.find()
                .sort({ _id: 1 })
                .skip((currentPage - 1) * PRODUCTS_PER_PAGE)
                .limit(PRODUCTS_PER_PAGE)
                .then(products => {
                    res.render(template, {
                        products: products,
                        totalProducts: totalProducts,
                        currentPage: currentPage,
                        totalPages: totalPages,
                        pageTitle: pageTitle,
                        path: routePath
                    });
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getIndex = (req, res, next) => {
    renderProductPage(req, res, next, 'shop/index', 'Shop', '/');
}


exports.getProducts = (req, res, next) => {
    renderProductPage(req, res, next, 'shop/product-list', 'All Products', '/products');
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
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
                totalPrice: totalPrice
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    const user = req.user;
    Product.findById(productId)
        .then(product => {
            return user.addToCart(product);
        })
        .then(() => {
            res.redirect('/cart');
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;
    const user = req.user;
    user.deleteItemFromCart(productId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getOrders = (req, res, next) => {
    const user = req.user;
    Order
        .find({ 'user.userId': user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders
            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const userId = req.user._id;

    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('Order not found.'));
        }
        else if (order.user.userId.toString() !== userId.toString()) {
            return next(new Error('Unauthorized access to invoice.'));
        } else {
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

            fs.mkdirSync(path.dirname(invoicePath), { recursive: true });

            const pdfDoc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                info: {
                    Title: 'Invoice ' + orderId,
                    Author: 'BookShop',
                    Subject: 'Order invoice'
                }
            });
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            const colors = {
                navy: '#00695C',
                darkGreen: '#004D40',
                paleGreen: '#EDF5F3',
                text: '#263B39',
                muted: '#35645F',
                line: '#D8E3E1',
                accent: '#FFEB3B',
                white: '#FFFFFF'
            };
            const pageWidth = pdfDoc.page.width - 100;
            const formatCurrency = amount => '$' + amount.toFixed(2);
            const invoiceDate = order.createdAt || order._id.getTimestamp();

            pdfDoc.rect(0, 0, pdfDoc.page.width, 118).fill(colors.navy);
            pdfDoc.fillColor(colors.white)
                .font('Helvetica-Bold')
                .fontSize(26)
                .text('BOOKSHOP', 50, 38);
            pdfDoc.fillColor(colors.accent)
                .font('Helvetica')
                .fontSize(9)
                .text('BOOKS & LITERATURE', 50, 70);
            pdfDoc.fillColor(colors.white)
                .font('Helvetica-Bold')
                .fontSize(30)
                .text('INVOICE', 50, 38, { width: pageWidth, align: 'right' });

            let y = 150;
            pdfDoc.fillColor(colors.text)
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('BILL TO', 50, y);

            pdfDoc.font('Helvetica-Bold')
                .fontSize(12)
                .text(order.user.name || 'Customer', 50, y + 20);
            pdfDoc.font('Helvetica')
                .fillColor(colors.muted)
                .fontSize(10)
                .text(req.user.email || '', 50, y + 38);

            const detailsX = 360;
            pdfDoc.fillColor(colors.text)
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('INVOICE DETAILS', detailsX, y);

            pdfDoc.font('Helvetica')
                .fontSize(10)
                .fillColor(colors.muted)
                .text('Invoice number', detailsX, y + 20);
            pdfDoc.fillColor(colors.text)
                .font('Helvetica-Bold')
                .text('#' + orderId.toString().slice(-10).toUpperCase(), 445, y + 20, {
                    width: 100,
                    align: 'right'
                });

            pdfDoc.font('Helvetica')
                .fontSize(10)
                .fillColor(colors.muted)
                .text('Invoice date', detailsX, y + 38);
            pdfDoc.fillColor(colors.text)
                .font('Helvetica-Bold')
                .text(invoiceDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }), 445, y + 38, {
                    width: 100,
                    align: 'right'
                });

            y = 225;
            const table = {
                itemX: 50,
                itemWidth: 260,
                qtyX: 310,
                qtyWidth: 55,
                unitX: 365,
                unitWidth: 90,
                amountX: 455,
                amountWidth: 90
            };

            pdfDoc.rect(50, y, pageWidth, 28).fill(colors.paleGreen);
            pdfDoc.fillColor(colors.text)
                .font('Helvetica-Bold')
                .fontSize(9);
            pdfDoc.text('ITEM', table.itemX + 8, y + 9, { width: table.itemWidth - 16 });
            pdfDoc.text('QTY', table.qtyX, y + 9, { width: table.qtyWidth, align: 'center' });
            pdfDoc.text('UNIT PRICE', table.unitX, y + 9, { width: table.unitWidth, align: 'right' });
            pdfDoc.text('AMOUNT', table.amountX, y + 9, { width: table.amountWidth - 8, align: 'right' });

            y += 28;
            let totalPrice = 0;
            order.products.forEach(prod => {
                const lineTotal = prod.quantity * prod.product.price;
                totalPrice += lineTotal;

                if (y > 650) {
                    pdfDoc.addPage();
                    y = 60;
                    pdfDoc.rect(50, y, pageWidth, 28).fill(colors.paleGreen);
                    pdfDoc.fillColor(colors.text)
                        .font('Helvetica-Bold')
                        .fontSize(9);
                    pdfDoc.text('ITEM', table.itemX + 8, y + 9, { width: table.itemWidth - 16 });
                    pdfDoc.text('QTY', table.qtyX, y + 9, { width: table.qtyWidth, align: 'center' });
                    pdfDoc.text('UNIT PRICE', table.unitX, y + 9, { width: table.unitWidth, align: 'right' });
                    pdfDoc.text('AMOUNT', table.amountX, y + 9, { width: table.amountWidth - 8, align: 'right' });
                    y += 28;
                }

                const rowHeight = 42;
                pdfDoc.fillColor(colors.text)
                    .font('Helvetica')
                    .fontSize(10)
                    .text(prod.product.title, table.itemX + 8, y + 12, {
                        width: table.itemWidth - 16,
                        height: rowHeight - 12,
                        ellipsis: true
                    });
                pdfDoc.text(prod.quantity.toString(), table.qtyX, y + 12, {
                    width: table.qtyWidth,
                    align: 'center'
                });
                pdfDoc.text(formatCurrency(prod.product.price), table.unitX, y + 12, {
                    width: table.unitWidth,
                    align: 'right'
                });
                pdfDoc.font('Helvetica-Bold')
                    .text(formatCurrency(lineTotal), table.amountX, y + 12, {
                        width: table.amountWidth - 8,
                        align: 'right'
                    });
                pdfDoc.moveTo(50, y + rowHeight).lineTo(545, y + rowHeight)
                    .strokeColor(colors.line)
                    .lineWidth(0.7)
                    .stroke();
                y += rowHeight;
            });

            y = Math.max(y + 18, 520);
            pdfDoc.moveTo(350, y).lineTo(545, y)
                .strokeColor(colors.line)
                .lineWidth(0.7)
                .stroke();

            pdfDoc.fillColor(colors.muted)
                .font('Helvetica')
                .fontSize(10)
                .text('Subtotal', 350, y + 16);
            pdfDoc.fillColor(colors.text)
                .font('Helvetica-Bold')
                .text(formatCurrency(totalPrice), 455, y + 16, {
                    width: 90,
                    align: 'right'
                });

            pdfDoc.rect(350, y + 42, 195, 42).fill(colors.navy);
            pdfDoc.fillColor(colors.white)
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('TOTAL', 365, y + 58);
            pdfDoc.fontSize(16)
                .text(formatCurrency(totalPrice), 455, y + 55, {
                    width: 75,
                    align: 'right'
                });

            pdfDoc.moveTo(50, 740).lineTo(545, 740)
                .strokeColor(colors.line)
                .lineWidth(0.7)
                .stroke();
            pdfDoc.fillColor(colors.muted)
                .font('Helvetica')
                .fontSize(8)
                .text('Thank you for your purchase.', 50, 752, {
                    width: 495,
                    align: 'center'
                });
            pdfDoc.end();

        }
    }).catch(err => next(err));
}