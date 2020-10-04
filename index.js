var express= require('express');
var app=express();

let server = require('./server');
let middleware = require('./middleware');

//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;

const dbName='hospitalManagement';
const url='mongodb://localhost:27017';
let db
MongoClient.connect(url,{ useUnifiedTopology: true}, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
    console.log("connected.....");
});

//fetching hospital details
app.get('/hospitaldetails',function(req,res){
    console.log("Fetching data from the hospital collection of hospitalmanagement database");
    var data = db.collection('Hospital').find().toArray()
    .then(result => res.json(result));
});

// fetching Ventiolator details
app.get('/ventilatordetails',(req,res) => {
    console.log("Fetching data from the ventiloators collection of hospitalmanagement database");
    var ventilatordetail = db.collection('Ventilators').find().toArray()
    .then(result => res.json(result));

});

//finding ventilator by name of the hospital
app.post('/searchventilatorbyname',(req,res) => {
    console.log("searching hospital by name");
    var name =req.query.name;
    console.log(name);
    var ventilatordetail = db.collection('Ventilators').find({'name':new RegExp(name,'i')}).toArray().then(result => res.json(result));
});


//finding ventilators by status
app.post('/searchventilatorbystatus',(req,res) =>{
    console.log("searching ventilator by status");
    var status = req.body.status;
    console.log(status);
    var ventilatordetails = db.collection('Ventilators')
    .find({ "status" : status }).toArray().then(result => res.json(result));

});

//search hospital by name
app.post('/searchhospital',middleware.checkToken, (req,res) => {
    var name = req.query.name;
    console.log(name);
    var hospitaldetails= db.collection('Hospital').find({'name': new RegExp(name, 'i')}).toArray().then(result => res.json(result));
});

//updating ventilator details 
app.put('/updateventilatordetails',(req,res) =>{
    var ventid = { vid: req.body.vid };
    console.log(ventid);
    var newvalues = { $set: { status: req.body.status } };
    db.collection('Ventilators').updateOne(ventid, newvalues,function (err, result){
        res.json('1 document updated in collection');
        if(err) throw err;
    });
});

//add ventilator
app.post('/addventilatorbyuser', (req,res) => {
    var hId= req.body.hid;
    var ventilatorId=req.body.vid;
    var status=req.body.status;
    var name=req.body.name;

    var item=
    {
        hId:hid, ventilatorId:vid, status:status, name:name
    };
    db.collection('Ventilators').insertOne(item, function (err, result){
        res.json('new item inserted');
    });
});

//delete ventilator by ventilatorid
app.delete('/delete',(req,res) => {
    var myquery = req.query.vid;
    console.log(myquery);

    var myquery1 = { vid: myquery };
    db.collection('Ventilators').deleteOne(myquery1,function (err,obj)
    {
        if(err) throw err;
        res.json("1 document is deleted from collection");
    });
});

app.listen(8080);

