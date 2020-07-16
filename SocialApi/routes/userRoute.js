const express = require("express");
const route = express.Router();
const { isAuth } = require("../config/isAuth");
const redis = require("redis");
const User = require("../models/User");

const publisher = redis.createClient();
const subscriber = redis.createClient();

var id ;
subscriber.on("message", function(channel, message){
    User.findByIdAndUpdate({_id: id}, {$push:{publicacao: {name: channel, texto: message}}}).then((user)=>{
    })
})

route.get('/redirect',(req,res)=>{
    id = req.user.id;
    User.findById({_id: req.user.id}).then((user) =>{
        var subs = user.subscriptions.slice(0);
        for (let index = 0; index < subs.length; index++) {
            subscriber.subscribe(subs[index])
        }
    })
    res.redirect('/user/home')
})

route.get("/home", isAuth, (req, res) => {

  User.findById({_id:req.user.id}).sort({postedAt: "desc"}).then((user) => {
    res.render("home",{publicacoes: user.publicacao});
  })
});

route.get("/logout", isAuth, (req, res) => {
  req.logout();
  req.flash("success_msg", "Disconnected");
  res.redirect("/");
});

route.get('/perfil/:id',isAuth,(req, res)=>{
    var igual;
    if(req.user._id == req.params.id) igual = true;
    User.findById({_id: req.params.id}).then((userF)=>{
        res.render('perfil',{userF: userF, igual:igual})
    }).catch((err)=>{
        console.log(err)
    })
})

route.post("/publicacao", isAuth,(req, res) => {
  publisher.publish(req.user.email, req.body.publicacao);
  User.findByIdAndUpdate({_id: req.user.id}, {$push:{publicacao: {name: req.user.email, texto: req.body.publicacao}}}).then(()=>{
     res.redirect("/user/home");
  }).catch((err)=>{
      req.flash("error_msg","Can't post now, try again later");
      res.redirect("/user/home");
  })

});

route.post('/results',isAuth,(req, res)=>{
    User.find({email: req.body.search}).then((users)=>{
        res.render('results',{users: users});
    }).catch((err)=>{
        console.log(err)
    })
})

route.post('/subscribe',isAuth,(req, res)=>{
    subscriber.subscribe(req.body.email);
    User.findById({_id: req.user.id}).then((user)=>{
        if(user.subscriptions.indexOf(req.body.email) === -1){
            User.findByIdAndUpdate({_id: req.user.id}, {$push: {subscriptions: req.body.email}}).then(()=>{
                req.flash('success_msg',"Subscribed")
                res.redirect('/user/home')
            })
        }else{
            req.flash('error_msg',"Already subscribed")
            res.redirect('/user/home');
        }
    }).catch((err)=>{
        req.flash('error_msg',"Error to subscribe",err);
        res.redirect('/user/home')
    })
})

module.exports = route;
