const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');
const User = require('../models/user');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isLoggedIn: false,
        errorMessage: req.flash('error')
    });
}

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPasswords = req.body.confirmPasswords;

    User.findOne({ email: email })
        .then(user => {
            if (user) {
                req.flash('error', 'An account with that email already exists.');
                res.redirect('/signup');
                return null;
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: hashedPassword,
                        cart: {
                            items: [],
                            totalPrice: 0
                        }
                    })
                    return newUser.save();
                })
                .then(() => resend.emails.send({
                    from: 'NodeJS@resend.dev',
                    to: [email],
                    subject: 'Signup Successful',
                    html: '<strong>You have successfully signed up!</strong>',
                }))
                .then(({ data, error }) => {
                    if (error) {
                        console.error({ error });
                    } else {
                        console.log({ data });
                    }
                    res.redirect('/login');
                });
        }).catch(err => console.log(err));
}

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error')
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }

            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        req.flash('error', 'Invalid email or password');
                        return res.redirect('/login');
                    }
                    req.session.loggedIn = true;
                    req.session.userId = user._id.toString();
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                }).catch(err => {
                    console.log(err);
                    res.redirect('/login');
                })
        }).catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error')
    });
}

exports.postReset = (req, res, next) => {
    const email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            }).then(user => {
                res.redirect('/login');
                return resend.emails.send({
                    from: 'NodeJS@resend.dev',
                    to: email,
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password reset.</p>
                        <p>Click this <a href="http://localhost:3000/reset/${user.resetToken}">link</a> to set a new password.</p>
                    `
                });
            }).catch(err => console.log(err));
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid or expired password reset token.');
                return res.redirect('/reset');
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Set New Password',
                errorMessage: req.flash('error'),
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid or expired password reset token.');
                return res.redirect('/reset');
            }
            return bcrypt.hash(newPassword, 12)
                .then(hashedPassword => {
                    user.password = hashedPassword;
                    user.resetToken = undefined;
                    user.resetTokenExpiration = undefined;
                    return user.save();
                })
                .then(() => {
                    res.redirect('/login');
                });

        }).catch(err => console.log(err));

}