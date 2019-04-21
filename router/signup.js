const express = require('express');
const router = express.Router();


const mongodb = require('mongodb').MongoClient;
// database connection
const uri = process.env.URL;
const option = { useNewUrlParser: true };
const mydb = "mydb"



router.post('/signup',(req,res) =>{ // signup form
    var kullaniciId = req.body.kullaniciId;
    var sifre = req.body.Sifre;
    var sifreTekrar = req.body.SifreTekrar;
    
    if(kullaniciId.trim() == "" || sifre.trim() == "") // send error if id or ps empty
      {
        res.render('signup', {err:true});
        return false;
      }
    else if (sifre != sifreTekrar){
      res.render('signup', {err: true});
      return false;
    }
      
  
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
            if(data.length == 0) resolve(true); // return true if collection empty because if its empty kullaniciId not exist
            data.forEach(element=>{ if(element.kullaniciId == kullaniciId){ resolve(false); } // return false if kullaniciId already exist
              resolve(true); // return true if kullaniciId not exist
            });
          });
        });
      };
  
  
      data()
      .then(found=>{ // wait data for execute
        if(found || null){
          mongodb.connect(uri,option,(err,client)=>{
            if (err) console.log(err);
            const db = client.db(mydb);
            db.collection("user").insertOne({kullaniciId: kullaniciId, sifre: sifre});
            res.redirect('/signin');
          })
        }
        else if(found == false) // if false return err
          res.render('signup', {err:true}); 
      })
      .catch((err)=>{ // catch error
        console.log(err);
        res.render('signup', {err:true}); 
      });
      client.close();
    });
    
  });


  module.exports = router;