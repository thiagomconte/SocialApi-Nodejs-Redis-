const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const handlebars = require('express-handlebars');
const passport = require('passport');
const bcrypt = require('bcryptjs')
const User = require('./models/User');
const userRoute = require('./routes/userRoute')
require('./config/auth')(passport)
require('./config/db');


const app = express();

app.engine('html', handlebars({ defaultLayout: "main", extname: ".html" }))
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
    secret:'santossempresantos',
    resave:true,
    saveUninitialized:true,
    cookie: {
        expires: new Date(Date.now() + 60 * 30000),
        maxAge: 30 * 24 * 60 * 60 * 1000,
      }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
})

app.use('/user',userRoute);

app.get('/', async (req, res) => {
    res.render('login');
})

app.post('/',(req, res, next) => {
    passport.authenticate("local",{
        successRedirect:'/user/redirect',
        failureRedirect:'/',
        failureFlash:true
    })(req, res, next)
})

app.get('/register', async (req, res)=>{
    res.render('register');
})

app.post('/register', async (req, res)=>{

    const hashedPassword = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
     User.findOne({email: req.body.email}).then( (user)=>{
        if(user){
            req.flash('error_msg', 'This account already exists.')
            res.redirect('/register');
        }else{
        newUser.save().then(()=>{
            req.flash('success_msg',"You have been registered");
            res.redirect('/');
         }).catch((err)=>{
            req.flash('error_msg', 'We had a problem registering you',err);
            res.redirect('/register');
         })
        }
    }).catch((err)=>{
        req.flash('error_msg', 'Internal server problem');
        res.redirect('/register');
    })
})

app.use(express.static(__dirname+'/public'));

var port =  process.env.PORT || 3000;
app.listen(port, ()=>{console.log(`Rodando em http://localhost:${port}`)});