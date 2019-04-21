const express = require('express');
const router = express.Router();
const session = require('express-session');
const mongodb = require('mongodb').MongoClient;
// database connection
const uri = encodeURI(process.env.MONGODB_URL);
const option = { useNewUrlParser: true };
const mydb = "mydb"

router.use(session({'secret': 'ChatApp',
                  resave: true,
                  saveUninitialized: true}));

router.post('/signin',(req,res)=>{
    var kullaniciId = req.body.kullaniciId;
    var sifre = req.body.Sifre;

    if(kullaniciId.trim() == "" || sifre.trim() == "") // send error if id or ps empty
    {
      res.render('signin', {err:true}); 
      return false;
    }

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
              if(data.length == 0) resolve(false); // if collection empty return false

              data.forEach(element=>{
                if(element.kullaniciId == kullaniciId && element.sifre == sifre){ // if id and ps match return true
                  resolve(true);
                }
              })
              resolve(false); // if cant match return false
            })
          })
        }

        data()
        .then(found=>{
          if(found){
            req.session.kullaniciId = kullaniciId;
            req.session.sifre = sifre;
            res.redirect('index');
          }
          else if(found == false)
            res.render('signin', {err: true});
        }).catch((err)=>{
          console.log(err);
          res.render('signin', {err:true});
        })
        client.close();
      })
})


module.exports = router;