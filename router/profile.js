const express = require('express');
const router = express.Router();
const session = require('express-session');
const mongodb = require('mongodb').MongoClient;
// database connection stringi
const uri = "mongodb+srv://Cengizhan:Cengiz53@cengizhan-qpwns.mongodb.net/" //encodeURI(process.env.MONGODB_URL);
const option = { useNewUrlParser: true };
const mydb = "mydb"

router.use(session({'secret': 'ChatApp',
                  resave: true,
                  saveUninitialized: true}));

// /profile/changeName endpointi
router.post('/changeName', (req,res)=>{
    //Başındaki ve sonundaki boşlukları sil
    let newName = req.body.new.trim();
    let found = false;
    //Yeni isim boş veya çok uzun ise
    if(newName == "" || newName.length >= 10){
        //Hata vererek sayfayı renderla
        res.render('../' + 'views/' + 'profile.ejs', {
            userName: req.session.kullaniciId,
            name: req.session.name,
            password: req.session.sifre, 
            err:'Update Failed. Please fill form and try again'});
            return false;
    }
    //Database bağlantısı oluştur
    mongodb.connect(uri, option, (err,client)=>{
        if(err) console.log(err);

        db = client.db("mydb");
        //Kullanıcılar tablosunu getir
        db.collection("user").find().toArray((err,result)=>{
            //Tüm kullanıcılar içerisinde isim önceden alınmış mı diye bak
            result.forEach(element => {
                if(element.name == newName){
                    found = true;
                }
            });
            //İsim önceden alınmamışsa
            if(found == false){
                let name = req.session.name;
                //Kullanıcının ismini değiştir 
                db.collection("user").updateOne({name:name},{$set: {name:newName}},(err,response)=>{
                    if(err) console.log(err);
                    req.session.name = newName;
                    //Sayfayı renderla
                    res.render('../' + 'views/' + 'profile.ejs', {
                        userName: req.session.kullaniciId,
                        name: req.session.name,
                        password: req.session.sifre,
                        err:'Update Successfull',
                      });
                })
                //Kullanıcının önceden attığı mesajların gönderici ismini değiştir
                db.collection("messages").updateMany({owner: name}, {$set : {owner: newName}}, (err,response)=>{
                    if(err) console.log(err);
                })
            }else{
                //Kullanıcı önceden varsa hata mesajı vererek sayfayı renderla
                res.render('../' + 'views/' + 'profile.ejs', {
                    userName: req.session.kullaniciId,
                    name: req.session.name,
                    password: req.session.sifre, 
                    err:'Update Failed. Name is not available'});
            }
            //Database bağlantısını kapat
            client.close();
        });
        
    })
});

// /profile/changeUsername endpointi
router.post('/changeUserName', (req,res)=>{
    //Başındaki ve sonundaki boşlukları sil
    let userName = req.body.new.trim();
    //Eğer isim boş ise veya çok uzun ise hata vererek renderla
    if(userName == "" || userName.length >= 10){
        res.render('../' + 'views/' + 'profile.ejs', {
            userName: req.session.kullaniciId,
            name: req.session.name,
            password: req.session.sifre, 
            err:'Update Failed. Please fill form and try again'});
            return false;
    }
    let found = false;
    let kullaniciId = req.session.kullaniciId;
    //Database bağlantısı oluştur
    mongodb.connect(uri, option, (err, client)=>{
        if(err) console.log(err);
        db = client.db("mydb");
        //Tüm kullanıcıları getir
        db.collection("user").find().toArray((err,result)=>{
            if(err) console.log(err);
            //Kullanıcıların içinde yeni isim mevcutmu diye kontrol et
            result.forEach(element=>{
                if(element.kullaniciId == userName){
                    found = true;
                }
            })
            //Eğer mevcut değilse ismi değiştir ve tekrar giriş yapması için signin sayfasına gönder
            if(found == false){
                db.collection("user").updateOne({kullaniciId: kullaniciId}, {$set : {kullaniciId: userName}},(err,response)=>{
                    if(err) console.log(err);
                    req.session.destroy();
                    res.redirect('/signin');
                })
            }else{
                //Eğer mevcutsa hata vererek renderla
                res.render('../' + 'views/' + 'profile.ejs', {
                    userName: req.session.kullaniciId,
                    name: req.session.name,
                    password: req.session.sifre, 
                    err:'Update Failed. Username is not available'});
            }
            //Database bağlantısını kapat
            client.close();
        })
    })

});

// /profile/changePassword endpointi 
router.post('/changePassword', (req,res)=>{
    //Başındaki ve sonundaki boşlukları sil
    let sifre = req.body.new.trim();
    // Eğer şifre boş ise veya 10 karakterden uzun ise
    if(sifre == "" || sifre.length >= 10 ){
        //Hata vererek sayfayı geri renderla
        res.render('../' + 'views/' + 'profile.ejs', {
            userName: req.session.kullaniciId,
            name: req.session.name,
            password: req.session.sifre, 
            err:'Update Failed. Please fill form and try again'});
            return false;
    }
    // Database bağlantısı oluştur
    mongodb.connect(uri, option, (err,client)=>{
        db = client.db("mydb");
        //Kullanıcı adıyla eşleşen kullanıcıyı bul ve şifresini değiştir
        db.collection("user").updateOne({kullaniciId: req.session.kullaniciId}, {$set: {sifre: sifre}}, (err, response)=>{
            if(err) console.log(err);
            req.session.destroy();
            // Tekrar giriş yapması için signin sayfasına geri gönder
            res.redirect('/signin');
        })
    })
});

module.exports = router;