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

// signin form ile tetiklenir
router.post('/signin',(req,res)=>{
    var kullaniciId = req.body.kullaniciId;
    var sifre = req.body.Sifre;
    //Kullanıcı adı veya şifre boş ise hata vererek geri gönder
    if(kullaniciId.trim() == "" || sifre.trim() == "") 
    {
      res.render('signin', {err:true}); 
      return false;
    }
      //Database bağlantısı oluştur
      mongodb.connect(uri, option, (err, client)=>{
        if(err) console.log(err);


        const db = client.db(mydb);

        var data = ()=>{
          return new Promise((resolve,reject)=>{
            db
            .collection("user")
            .find()
            .toArray((err,data)=>{
              if(err) reject(err);
              //Hiç kayıtlı kullanıcı yoksa false döndürerek bulunamadığını belirt
              if(data.length == 0) resolve(false);
              //Kullanıcı tablosundaki kullanıcılar ile karşılaştırma yaparak eşleşme var mı diye kontrol et
              data.forEach(element=>{
                //Eşleşme varsa true döndür ve sessiona kaydet
                if(element.kullaniciId == kullaniciId && element.sifre == sifre){ 
                  req.session.kullaniciId = kullaniciId;
                  req.session.sifre = sifre;
                  req.session.name = element.name;
                  resolve(true);
                }
              })
              //Eşleşme yoksa false döndür
              resolve(false);
            })
          })
        }

        //Eşleşme true döndürdüyse index sayfasına (chat odasına) gönder
        data()
        .then(found=>{
          if(found){
            res.redirect('index');
          }
          //Eşleşme false ise hata vererek signin sayfasına geri gönder
          else if(found == false)
            res.render('signin', {err: true});
        }).catch((err)=>{
          console.log(err);
          res.render('signin', {err:true});
        })
        //Database bağlantısını kapat
        client.close();
      })
})


module.exports = router;