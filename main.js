const express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      http = require('http').createServer(app);
      io = require('socket.io')(http);
      signup = require('./router/signup'),
      signin = require('./router/signin'),
      session = require('express-session'),
      cookie = require('cookie'),
      cookieParser = require('cookie-parser'),
      mongodb = require('mongodb').MongoClient,
      connect = require('connect');
      port = process.env.PORT || 5000;

      var onlineUsers = [];
      
 
// database connection
const uri = "mongodb+srv://Cengizhan:Cengiz53@cengizhan-qpwns.mongodb.net/" //encodeURI(process.env.MONGODB_URL);
const option = { useNewUrlParser: true };


/* Middlewares */
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(signup);
app.use(signin);
app.use(express.static(__dirname + '/public'));
app.use(session({'secret': 'ChatApp',
resave: true,
saveUninitialized: true
}));



app.get('/signup', (req,res) =>{
  if(req.session.kullaniciId || req.session.sifre){
    res.redirect('/index');
    return true;
  }
  res.render(__dirname + '/views'+ '/signup.ejs', {err: undefined});
});

app.get('/', (req,res)=>{
  if(req.session.kullaniciId || req.session.sifre){
    res.redirect('/index');
    return true;
  }
  res.render(__dirname + '/views'+ '/index.ejs', {err: undefined});
});

app.get('/signin', (req,res) =>{
  if(req.session.kullaniciId || req.session.sifre){
    res.redirect('/index');
    return true;
  }
  res.render(__dirname + '/views'+ '/signin.ejs', {err: undefined});
});

app.get('/index', (req,res) =>{
  if(!req.session.kullaniciId || !req.session.sifre){
    res.redirect('/signin');
    return false;
  }
  res.cookie('kullaniciId', req.session.kullaniciId);
  res.render(__dirname + '/views'+ '/chatroom.ejs', {kullaniciId: req.session.kullaniciId});
});

app.get('/logout', (req,res)=>{
  req.session.destroy();
  res.end();
})
app.get('*', (req,res)=>{
  res.send('404 NOT FOUND');
})


/* SOCKET CODES */ 
io.on('connection', function(socket){
  var cookies = cookie.parse(socket.handshake.headers.cookie);
  onlineUsers.push({socketId: socket.id, kullaniciId:cookies.kullaniciId });
  
  mongodb.connect(uri,option, (err,client)=>{
    const db = client.db("mydb");
    var countMessage = () =>{ // return message size
      return new Promise((resolve,reject)=>{
        resolve(db.collection("messages").countDocuments());
      })
    }
    
    var allMessage = () => new Promise((resolve,reject)=>{ // return last 50 message
     
      countMessage()
      .then(count=>{
        if(count-20 > 0 ){
          db.collection("messages")
          .find().sort({"id": 1}).skip(count - 20).limit(20).toArray((err,result)=>{ 
            if(err) reject(err);
            console.log(count -50);
            resolve({result:result,count:count});
          })
        }
    })
  });
    
    allMessage()
    .then((result)=>{ // wait for old messages come from database
        io.sockets.connected[socket.id].emit("oldMessages", result.result,result.count); // push messages just new client 
        client.close();
    })
    .catch((err)=>console.log(err));
    
  })


  

  io.emit("online users" ,onlineUsers);

  socket.on('new message', (message)=>{
    if(message.trim() != ""){
      onlineUsers.forEach(element=>{
        if(element.socketId == socket.id){
          mongodb.connect(uri, option, (err, client)=>{
            var messagesid = new Date().getTime();
            const db = client.db("mydb");
            db.collection("messages")
            .insertOne({message: message, owner: element.kullaniciId,id:messagesid}); // add to database
            io.emit("new message", message, element.kullaniciId);
            client.close();
            
          })
        }
      })
    }
  });

  socket.on('disconnect', function(){ //trigger when someone disconnected
    var geciciArray = [];
    onlineUsers.forEach(element=>{
      if(element.socketId == socket.id){}
      else
        geciciArray.push(element);
    });
      onlineUsers = [];
    geciciArray.forEach(element=>{
      onlineUsers.push(element);
    });


    mongodb.connect(uri, option, (err,client)=>{
      if(err) console.log(err);
      const db = client.db("mydb");
      db.collection("sessions").deleteMany({ socketId : socket.id });
      client.close();
    });
    io.emit("online users" ,onlineUsers);
  });


  socket.on('ask older massage', (countIndex,countTotal)=>{
    var newMessage = () =>{
      return new Promise((resolve,reject)=>{
        mongodb.connect(uri,option, (err,client)=>{
          if (err) reject(err);
          var db = client.db("mydb");
          if(countTotal-countIndex> 0 ){
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
      io.sockets.connected[socket.id].emit("send older message", result);
    })
  })

});

/* ------------------------ */

/* LISTEN PORT */
http.listen(port, () =>{
  console.log("server is running on  "+ port + ". port");
});



