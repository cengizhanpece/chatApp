//Gerekli modülleri yükle
const express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      http = require('http').createServer(app);
      io = require('socket.io')(http);
      signup = require('./router/signup'),
      signin = require('./router/signin'),
      profile = require('./router/profile'),
      session = require('express-session'),
      cookie = require('cookie'),
      cookieParser = require('cookie-parser'),
      mongodb = require('mongodb').MongoClient,
      connect = require('connect');
      port = process.env.PORT || 5000;

      var onlineUsers = [];
      
 
// Database connection stringi
const uri = "mongodb+srv://Cengizhan:Cengiz53@cengizhan-qpwns.mongodb.net/" //encodeURI(process.env.MONGODB_URL);
const option = { useNewUrlParser: true };


/* Middlewares */
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(signup);
app.use(signin);
app.use(profile);
app.use(express.static(__dirname + '/public'));

app.use(session({'secret': 'ChatApp',
  resave: true,
  saveUninitialized: true
}));


//Signup sayfa endpointi
app.get('/signup', (req,res) =>{
  //Eğer kullanıcı giriş yapmış ise
  if(req.session.kullaniciId || req.session.sifre){
    //Direkt olarak chat odasına gönder
    res.redirect('/index');
    return true;
  }
  //Kullanıcı giriş yapmamışsa signup sayfasını renderla
  res.render(__dirname + '/views'+ '/signup.ejs', {err: undefined});
});

//Anasayfa endpointi
app.get('/', (req,res)=>{
  //Eğer kullanıcı giriş yapmış ise
  if(req.session.kullaniciId || req.session.sifre){
    //Direkt olarak chat odasına gönder
    res.redirect('/index');
    return true;
  }
  //Kullanıcı giriş yapmamışsa anasayfayı renderla
  res.render(__dirname + '/views'+ '/index.ejs', {err: undefined});
});

// Sign In sayfa endpointi
app.get('/signin', (req,res) =>{
  //Eğer kullanıcı giriş yapmış ise
  if(req.session.kullaniciId || req.session.sifre){
    //Direkt olarak chat odasına gönder
    res.redirect('/index');
    return true;
  }
  //Kullanıcı giriş yapmamışsa signin sayfasını renderla
  res.render(__dirname + '/views'+ '/signin.ejs', {err: undefined});
});

//Chat sayfası endpointi (asıl uygulama)
app.get('/index', (req,res) =>{
  //Eğer kullanıcı giriş yapmamış ise
  if(!req.session.kullaniciId || !req.session.sifre){
    //Sign in sayfasına gönder
    res.redirect('/signin');
    return false;
  }
  //Cookie ekleyerek kullanıcıyı hatırla
  res.cookie('kullaniciId', req.session.name);
  //Chat sayfasını renderla
  res.render(__dirname + '/views'+ '/chatroom.ejs', {kullaniciId: req.session.name});
});

//Profile sayfası endpointi
app.get('/profile', (req,res)=>{
  //Kullanıcı önceden giriş yapmışsa
  if(req.session.kullaniciId || req.session.sifre){
    //Kullanıcıya ait bilgilerle profile sayfasını renderla
    res.render(__dirname + '/views' + '/profile.ejs',
    {
      userName: req.session.kullaniciId,
      name: req.session.name,
      password: req.session.sifre,
      err:undefined,
    });
    return true;
  }
  //Giriş yapmamış ise signin sayfasını renderla
  res.render(__dirname + '/views'+ '/signin.ejs', {err: undefined});
});


//Logout endpointi
app.get('/logout', (req,res)=>{
  //Sessionları silerek çıkış yap
  req.session.destroy();
  //Sign in sayfasına gönder
  res.redirect('/signin');
  res.end();
})

//Yukarıdaki endpointler dışında herhangi bir sayfaya ulaşılmaya çalışırsa
app.get('*', (req,res)=>{
  //404 hata kodu gönder
  res.status(404);
  //Not found sayfasını renderla
  res.render(__dirname + '/views' + '/notfound.ejs');
})


/* SOCKET CODES */ 
//Her yeni bağlanan kullanıcı için
io.on('connection', function(socket){
  //Socketten cookileri al
  var cookies = cookie.parse(socket.handshake.headers.cookie);
  //Alınan bilgilerle onlineUsers listesine kullanıcı ekle
  onlineUsers.push({socketId: socket.id, kullaniciId:cookies.kullaniciId });
  
  //Database bağlantısı oluştur
  mongodb.connect(uri,option, (err,client)=>{
    const db = client.db("mydb");
    // Tüm mesajları sayan fonksiyon tanımlaması
    var countMessage = () =>{ 
      return new Promise((resolve,reject)=>{
        resolve(db.collection("messages").countDocuments());
      })
    }
    // Son 50 mesajı geri döndüren fonksiyon tanımlaması
    var allMessage = () => new Promise((resolve,reject)=>{ 
     
      countMessage()
      .then(count=>{
        if(count-20 > 0 ){
          //count - 20 kaç tane dökümanı skiplememiz gerektiğini verir (Ekranda 50 tane mesaj listeliyoruz). Gerekli skipleme yapılıp geriye kalanları döndürür
          db.collection("messages")
          .find().sort({"id": 1}).skip(count - 20).limit(20).toArray((err,result)=>{ 
            if(err) reject(err);
            console.log(count -50);
            resolve({result:result,count:count});
          })
        }
    })
  });
     // Kullanıcı ilk giriş yaptığında en son atılmış 50 mesajı geri döndürmek için
    allMessage()
    .then((result)=>{
      //Sadece bağlanan sokete gönder
        io.sockets.connected[socket.id].emit("oldMessages", result.result,result.count); 
        //database bağlantısını kapat
        client.close();
    })
    .catch((err)=>console.log(err));
    
  })


  
  //Online Userları gönder
  io.emit("online users" ,onlineUsers);

  //Yeni mesaj geldiğinde
  socket.on('new message', (message)=>{
    //Mesajın başındaki ve sonundaki boşlukları sil
    if(message.trim() != ""){
      //Açık olan her kullanıcı için
      onlineUsers.forEach(element=>{
        //Doğru kullanıcıdan gelip gelmediğini sorgula
        if(element.socketId == socket.id){
          //Database bağlantısı oluştur
          mongodb.connect(uri, option, (err, client)=>{
            //Mesaj idsi olarak şuanki zamanı ata
            var messagesid = new Date().getTime();
            const db = client.db("mydb");
            //Mesajı databaseye ekle 
            db.collection("messages")
            .insertOne({message: message, owner: element.kullaniciId,id:messagesid});
            //Tüm bağlı kullanıcılara yeni mesajı gönder
            io.emit("new message", message, element.kullaniciId);
            //Database bağlantısnı kapat
            client.close();
          })
        }
      })
    }
  });
  
  //Socket bağlantısı bittiğinde tetiklenir
  socket.on('disconnect', function(){
    var geciciArray = [];
    //Online users listesinden çıkış yapan userı çıkart
    onlineUsers.forEach(element=>{
      if(element.socketId == socket.id){}
      else
        geciciArray.push(element);
    });
      onlineUsers = [];

    geciciArray.forEach(element=>{
      onlineUsers.push(element);
    });

    //Database bağlantısı oluştur
    mongodb.connect(uri, option, (err,client)=>{
      if(err) console.log(err);
      const db = client.db("mydb");
      //Çıkış yapank kullanıcının sessionını databaseden sil
      db.collection("sessions").deleteMany({ socketId : socket.id });
      //Database bağlantısını kapat
      client.close();
    });
    //Yeni oluşturulan güncel onlineUsers listesini bağlı olan herkese gönder
    io.emit("online users" ,onlineUsers);
  });

  //Kullanıcı eski mesajları görme isteği gönderdiğinde tetiklenir
  socket.on('ask older massage', (countIndex,countTotal)=>{
    //İstenilen mesajı geri döndüren fonksiyon tanımlaması
    var newMessage = () =>{
      return new Promise((resolve,reject)=>{
        //Database bağlantısı oluştur
        mongodb.connect(uri,option, (err,client)=>{
          if (err) reject(err);
          var db = client.db("mydb");
          //Kullanıcının şimdiye kadar gördüğü mesajlardan toplam mesaj sayısını çıkar. 0 dan büyükse hala görmediği mesaj kalmış demektir
          if(countTotal-countIndex> 0 ){
            //Görülmemiş mesajı döndürür
            db.collection("messages")
            .find().sort({"id": 1}).skip(countTotal - countIndex).limit(20).toArray((err,result)=>{ 
              if(err) reject(err);
              resolve(result);
            })
          }
        })
      })
    }

    newMessage()
    .then(result=>{
      //Kullanıcıya eski mesajlar gönderilir
      io.sockets.connected[socket.id].emit("send older message", result);
    })
  })

});

/* ------------------------ */

/* HTPP PORTU */
http.listen(port, () =>{
  console.log("server is running on  "+ port + ". port");
});



