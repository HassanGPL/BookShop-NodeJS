const getDb = require('../utils/database').getDb;
const mongodb = require('mongodb');

class User {
    constructor(username, email) {
        this.name = username;
        this.email = email;
    }
    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this)
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    static findById(userId) {
        const db = getDb();
        const id = new mongodb.ObjectId(userId);
        return db.collection('users')
            .findOne({ _id: id })
            .then(user => {
                console.log(user);
                return user;
            }).catch(err => console.log(err));
    }
}

module.exports = User;