const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;

let _db;

const mongoConnection = (cb) => {
    mongoClient
        .connect('mongodb+srv://hassanahmed11920_db_user:Jtzabjwln4UxfuJF@cluster0.bbisxfp.mongodb.net/shop?appName=Cluster0')
        .then(client => {
            console.log('MONGODB CONNECTED!');
            _db = client.db;
            cb();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No Database Found!';
}

exports.mongoConnection = mongoConnection;
exports.getDb = getDb;