var express = require('express');
var router = express.Router();

const Datastore = require('nedb-promises')
let datastore = Datastore.create('./db.db')

const shortid = require('shortid');

/* GET home page. */
router.get('/', function(req, res, next) {
  datastore.find().then((value)=>{
    res.render('index', { title: 'homeERP',items:value });
  })
});

router.get('/listJson',(req,res)=>{
  datastore.find().then((value)=>{
    res.send(value)
  })
})

router.get('/delete/:id',(req,res)=>{
  datastore.remove({
    uuid:req.params.id
  }).then((value)=>{
    res.send({
      status:"okay",
      body:value
    })
  }).catch((reason)=>{
    res.send({
      status:"failure",
      body:reason
    })
  })
})

router.post('/change/:id',(req,res)=>{
  datastore.update({
    uuid:req.params.id
  },{$set:{...req.body}}).then((value)=>{
    res.send({
      status:"okay",
      body:value
    })
  }).catch((reason)=>{
    res.send({
      status:"failure",
      body:reason
    })
  })
})

router.get('/s/:id',(req,res)=>{
  // console.log(req.params.id)
  // res.send(req.params.id)
  datastore.find({uuid:req.params.id}).then((value)=>{
    res.send({
      status:"okay",
      body:value
    })
  }).catch((reason)=>{
    res.render('error')
  })
})

router.get('/a/:id',(req,res)=>{
  datastore.find({uuid:req.params.id}).then((value)=>{
    res.send({
      status:"okay",
      body:value
    })
  }).catch((reason)=>{
    res.send({
      status:"failure",
      body:reason
    })
  })
})

router.post('/add',(req,res)=>{
  // console.log(req.body)
  if("name" in req.body && "category" in req.body && "stock" in req.body){
    let newItem = {uuid:shortid.generate(),...req.body}
    // res.send(newItem)
    datastore.insert(newItem).then((value)=>{
      res.send({
        status:"okay",
        body:value
      })
    }).catch((reason)=>{
      res.send({
        status:"failure",
        body:reason
      })
    })
  }else{
    res.send({
      status:"failure",
      body:"wrong req"
    })
  }
})

router.get('/add',(req,res)=>{
  res.render('add',{ title: 'homoERP' })
})

router.get('/addItem',(req,res)=>{
  // res.redirect('/')
  if("name" in req.query && "category" in req.query && "stock" in req.query){
    let newItem = {uuid:shortid.generate(),...req.query}
    // res.send(newItem)
    datastore.insert(newItem).then((value)=>{
      res.redirect('/')
    }).catch((reason)=>{
      res.send({
        status:"failure",
        body:reason
      })
    })
  }else{
    res.send({
      status:"failure",
      body:"wrong req"
    })
  }
})

module.exports = router;
