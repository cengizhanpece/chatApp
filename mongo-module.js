const MongoClient = require('mongodb').MongoClient;



module.exports = class Database {
    constructor(Uri, Options, Database) {
        this.uri = Uri;
        this.options = Options;
        this.database = Database;
    }

    insertOne(collection, data) {
        MongoClient.connect(this.uri, this.options,  (err, db)=> {
            if (err) throw err;
            var dbo = db.db(this.database);

            dbo.collection(collection).insertOne(data,(err, res) =>{
                if (err) throw err;
                console.log("body: %j inserted", data);
            });
            db.close();
        });
    }

    createCollection(collection) {
        MongoClient.connect(this.uri, this.options, (err, db)=> {
            if (err) throw err;
            var dbo = db.db(this.database);
            dbo.createCollection(collection, (err, res)=> {
                if (err) throw err;
                console.log("Collection created!");
                db.close();
            });
        });
    }


    findOne(collection, callback, query = {}) {
        MongoClient.connect(this.uri, this.options, (err, db) =>{
            if (err) throw err;
            var dbo = db.db(this.database);
            dbo.collection(collection).findOne(query,(err, result)=> {
                if (err) throw err;
                callback(result);
                db.close();
                
            });
        });
    }

    find(collection, callback, query = {}, projection = {}) {
        MongoClient.connect(this.uri, this.options, (err, db)=> {
            if (err) throw err;
            var dbo = db.db(this.database);
            dbo.collection(collection).find(query, { projection: projection }).toArray((err, result) =>{
                if (err) throw err;
                db.close();
                callback(result);
            });
        });
    }
}