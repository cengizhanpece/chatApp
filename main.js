const express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      signup = require('./router/signup'),
      signin = require('./router/signin'),
      session = require('express-session'),
      port = process.env.PORT || 5000;


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(signup);
app.use(signin);
app.use(express.static(__dirname + '/public'));
app.use(session({'secret': 'ChatApp',
                  resave: true,
                  saveUninitialized: true}));

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
  res.render(__dirname + '/views'+ '/chatroom.ejs', {err: undefined, kullaniciId: req.session.kullaniciId});
});

app.get('*', (req,res)=>{
  res.send('404 NOT FOUND');
})

app.listen(port, () =>{
  console.log("server is running on  "+ port + ". port");
});
