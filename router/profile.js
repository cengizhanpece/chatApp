const express = require('express');
const router = express.Router();
const session = require('express-session');
const mongodb = require('mongodb').MongoClient;
// database connection
const uri = "mongodb+srv://Cengizhan:Cengiz53@cengizhan-qpwns.mongodb.net/" //encodeURI(process.env.MONGODB_URL);
const option = { useNewUrlParser: true };
const mydb = "mydb"

router.use(session({'secret': 'ChatApp',
                  resave: true,
                  saveUninitialized: true}));


router.post('/changeName', (req,res)=>{
    let newName = req.body.new.trim();
    let found = false;
    if(newName == ""){
        res.render('../' + 'views/' + 'profile.ejs', {
            userName: req.session.kullaniciId,
            name: req.session.name,
            password: req.session.sifre, 
            err:'Update Failed. Please fill form and try again'});
            return false;
    }
    mongodb.connect(uri, option, (err,client)=>{
        if(err) console.log(err);

        db = client.db("mydb");
        db.collection("user").find().toArray((err,result)=>{
            result.forEach(element => {
                if(element.name == newName){
                    found = true;
                }
            });
            if(found == false){
                let name = req.session.name;
                db.collection("user").updateOne({name:name},{$set: {name:newName}},(err,response)=>{
                    if(err) console.log(err);
                    req.session.name = newName;
                    res.render('../' + 'views/' + 'profile.ejs', {
                        userName: req.session.kullaniciId,
                        name: req.session.name,
                        password: req.session.sifre,
                        err:'Update Successfull',
                      });
                })
                db.collection("messages").updateMany({owner: name}, {$set : {owner: newName}}, (err,response)=>{
                    if(err) console.log(err);
                })
            }else{
                res.render('../' + 'views/' + 'profile.ejs', {
                    userName: req.session.kullaniciId,
                    name: req.session.name,
                    password: req.session.sifre, 
                    err:'Update Failed. Name is not available'});
            }
            client.close();
        });
        
    })
});

router.post('/changeUserName', (req,res)=>{
    let userName = req.body.new.trim();
    if(userName == ""){
        res.render('../' + 'views/' + 'profile.ejs', {
            userName: req.session.kullaniciId,
            name: req.session.name,
            password: req.session.sifre, 
            err:'Update Failed. Please fill form and try again'});
            return false;
    }
    let found = false;
    let kullaniciId = req.session.kullaniciId;
    mongodb.connect(uri, option, (err, client)=>{
        if(err) console.log(err);
        db = client.db("mydb");
        db.collection("user").find().toArray((err,result)=>{
            if(err) console.log(err);
            result.forEach(element=>{
                if(element.kullaniciId == userName){
                    found = true;
                }
            })
                if(found == false){
                    db.collection("user").updateOne({kullaniciId: kullaniciId}, {$set : {kullaniciId: userName}},(err,response)=>{
                        if(err) console.log(err);
                        req.session.destroy();
                        res.redirect('/signin');
                    })
                }else{
                    res.render('../' + 'views/' + 'profile.ejs', {
                        userName: req.session.kullaniciId,
                        name: req.session.name,
                        password: req.session.sifre, 
                        err:'Update Failed. Username is not available'});
                }
            client.close();
        })
    })

});

router.post('/changePassword', (req,res)=>{
    let sifre = req.body.new.trim();
    if(sifre == ""){
        res.render('../' + 'views/' + 'profile.ejs', {
            userName: req.session.kullaniciId,
            name: req.session.name,
            password: req.session.sifre, 
            err:'Update Failed. Please fill form and try again'});
            return false;
    }
    mongodb.connect(uri, option, (err,client)=>{
        db = client.db("mydb");
        db.collection("user").updateOne({kullaniciId: req.session.kullaniciId}, {$set: {sifre: sifre}}, (err, response)=>{
            if(err) console.log(err);
            req.session.destroy();
            res.redirect('/signin');
        })
    })
});

module.exports = router;