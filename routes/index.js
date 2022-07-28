var express = require('express');
var router = express.Router();

const Datastore = require('nedb-promises')
let datastore = Datastore.create('./db.db')

const ExcelJS = require('exceljs');

const shortid = require('shortid');

require('dotenv').config()

/* GET home page. */
router.get('/', function (req, res, next) {
  datastore.find().then((value) => {
    res.render('index', { title: 'homeERP', items: value });
  })
});

router.get('/listJson', (req, res) => {
  datastore.find().then((value) => {
    res.send(value)
  })
})

router.get('/delete/:id', (req, res) => {
  datastore.remove({
    uuid: req.params.id
  }).then((value) => {
    res.send({
      status: "okay",
      body: value
    })
  }).catch((reason) => {
    res.send({
      status: "failure",
      body: reason
    })
  })
})

router.post('/change/:id', (req, res) => {
  datastore.update({
    uuid: req.params.id
  }, { $set: { ...req.body } }).then((value) => {
    res.send({
      status: "okay",
      body: value
    })
  }).catch((reason) => {
    res.send({
      status: "failure",
      body: reason
    })
  })
})

router.get('/s/:id', (req, res) => {
  // console.log(req.params.id)
  // res.send(req.params.id)
  datastore.find({ uuid: req.params.id }).then((value) => {
    res.send({
      status: "okay",
      body: value
    })
  }).catch((reason) => {
    res.render('error')
  })
})

router.get('/a/:id', (req, res) => {
  datastore.find({ uuid: req.params.id }).then((value) => {
    res.send({
      status: "okay",
      body: value
    })
  }).catch((reason) => {
    res.send({
      status: "failure",
      body: reason
    })
  })
})

router.post('/add', (req, res) => {
  // console.log(req.body)
  if ("name" in req.body && "category" in req.body && "stock" in req.body) {
    let newItem = { uuid: shortid.generate(), exported: false, ...req.body }
    // res.send(newItem)
    datastore.insert(newItem).then((value) => {
      res.send({
        status: "okay",
        body: value
      })
    }).catch((reason) => {
      res.send({
        status: "failure",
        body: reason
      })
    })
  } else {
    res.send({
      status: "failure",
      body: "wrong req"
    })
  }
})

router.get('/add', (req, res) => {
  res.render('add', { title: 'homoERP' })
})

router.get('/addItem', (req, res) => {
  // res.redirect('/')
  if ("name" in req.query && "category" in req.query && "stock" in req.query) {
    let newItem = { uuid: shortid.generate(), exported: false, ...req.query }
    // res.send(newItem)
    datastore.insert(newItem).then((value) => {
      res.redirect('/add')
    }).catch((reason) => {
      res.send({
        status: "failure",
        body: reason
      })
    })
  } else {
    res.send({
      status: "failure",
      body: "wrong req"
    })
  }
})

router.get('/export', (req, res) => {
  datastore.find({ exported: false }).then((value) => {
    if (value.length > 0) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('items');
      worksheet.addRow([
        'url',
        'name',
        'category',
        'stock'
      ])
      value.forEach((item, index, array) => {
        let rowIndex = index + 1;
        for(i=0;i<item.stock;i++){
          worksheet.addRow([
            `${process.env.SERVER}s/${item.uuid}`,
            item.name,
            item.category,
            item.stock
          ])
        }
      })
      datastore.update({ exported: false }, { $set: { exported: true } }, {multi:true})
      workbook.xlsx.writeBuffer().then((buffer) => {
        const fileName = "Items.xlsx"
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.send(buffer);
      })
    }else{
      res.redirect('/')
    }
  }).catch((reason) => {
    res.send(reason)
  })

});

module.exports = router;
