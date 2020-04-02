const express = require('express');
const router = express.Router();


const mongodb = require('mongodb').MongoClient;
// database connection stringi
const uri = "mongodb+srv://Cengizhan:Cengiz53@cengizhan-qpwns.mongodb.net/" //encodeURI(process.env.MONGODB_URL);
const option = { useNewUrlParser: true };
const mydb = "mydb"


//signup form ile tetiklenir
router.post('/signup',(req,res) =>{
    var kullaniciId = req.body.kullaniciId;
    var sifre = req.body.Sifre;
    var sifreTekrar = req.body.SifreTekrar;
    console.log(uri);
  // kullanıcı adı veya şifre boş ise hata vererek geri renderla
    if(kullaniciId.trim() == "" || sifre.trim() == "") 
      {
        res.render('signup', {err:true});
        return false;
      }
      // şifre ile şifretekrar eşleşmiyosa hata vererek geri renderla
    else if (sifre != sifreTekrar){
      res.render('signup', {err: true});
      return false;
    }
      
    //database bağlantısı oluştur
    mongodb.connect(uri, option,(err,client)=>{
      if(err) console.log(err);
      const db = client.db(mydb);
      var data = () => {
        return new Promise((resolve, reject) =>{
          db
          .collection("user")
          .find()
          .toArray((err,data)=>{
            if(err) reject(err);
            // Eğer hiç data yoksa true döndür, hiç data yoksa kullanıcıId kullanılabilirdir
            if(data.length == 0) resolve(true); 
            data.forEach(element=>{ if(element.kullaniciId == kullaniciId){ resolve(false); } // Kullanıcı Id önceden varsa false döndür
              resolve(true); // kullanıcıId yoksa true döndür
            });
          });
        });
      };
  
  
      data()
      .then(found=>{
         // eğer kullanıcı adı kullanılabilirse
        if(found || null){
          //Database bağlantısı oluştur
          mongodb.connect(uri,option,(err,client)=>{
            if (err) console.log(err);
            const db = client.db(mydb);
            //Databaseye kaydet 
            db.collection("user").insertOne({kullaniciId: kullaniciId, sifre: sifre});
            //Giriş yapması için signin sayfasına yönlendir
            res.redirect('/signin');
          })
        }
         // Kullanılabilir değilse hata vererek signup sayfasını tekrar renderla
        else if(found == false)
          res.render('signup', {err:true}); 
      })
      .catch((err)=>{
        console.log(err);
        res.render('signup', {err:true}); 
      });
      //database bağlantısını kapat
      client.close();
    });
    
  });


  module.exports = router;