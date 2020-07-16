const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('*',{useFindAndModify:false,useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true}).then(()=>{
    console.log('Banco conectado');
}).catch((err)=>{
    console.log(err);
})
