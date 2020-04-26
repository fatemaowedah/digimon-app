'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const PORT = process.env.PORT ||4000;
const app = express();
const client = new pg.Client (process.env.DATABASE_URL);
client.on('error', errorHandler);
const methodOverride = require('method-override');

app.use(cors());
app.use (express.static('./public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.get('/', getDigimon);

function getDigimon(req, res){
    let url = `https://digimon-api.herokuapp.com/api/digimon`
    superagent.get(url)
    .then (result =>{
        let data = result.body;
        let array = data.map(val=>{
            return new Digimon(val)
        })
        res.render('index',{data: array})
    }).catch((err)=> errorHandler(err,req,res));   
}
app.get('/favorite', favDigimonSave);
function favDigimonSave(req, res){
    let SQL = 'SELECT * FROM digmon;';
    client.query(SQL)
    .then(result =>{
        res.render('faviourte', {data: result.rows})
    });
}
app.post('/', favDigimon);
function favDigimon(req, res){
    let name = req.body.name;
    let img = req.body.img;
    let level = req.body.level;
    let SQL = 'INSERT INTO digmon (name,img,level) VALUES ($1,$2,$3);';
    let safeValues= [name,img,level];
    return client.query(SQL, safeValues)
    .then(()=>{
        res.redirect('/favorite');
    });
}
app.get('/detail/:digmon', detailPage);
function detailPage(req,res){
    let buttonClick = req.params.digmon;
    let SQL = 'SELECT * FROM digmon WHERE id = $1;';
    let safeValues= [buttonClick];
    return client.query(SQL,safeValues)
    .then(result=>{
        res.render('details',{ data:result.rows[0]});
    })
}
app.delete('/delete/:digmon', deleteDigmon);
function deleteDigmon(req, res){
    let buttonClick = req.params.digmon;
    let SQL = 'DELETE FROM digmon WHERE id = $1;';
    let safeValues= [buttonClick];
    client.query(SQL,safeValues)
    .then(result =>{
        favDigimonSave(req,res)
    })
    
}
app.put ('/update/:digmon', updateDigmon)
function updateDigmon (req, res){
    let name = req.body.name;
    let img = req.body.img;
    let level = req.body.level;
    let buttonClick = req.params.digmon;
    let SQL = 'UPDATE digmon SET name=$1, img=$2 , level=$3 WHERE id=$4';
    let safeValues= [name, img, level, buttonClick]
    client.query(SQL,safeValues)
    .then(result =>{
        detailPage(req,res);
    })


}

function Digimon (data){
    this.name = data.name;
    this.img = data.img;
    this.level = data.level;
}

client.connect()
.then(()=>{
    app.listen(PORT , ()=>{
        console.log(`up and runnning to port ${PORT}`);
    })
});

function errorHandler(err, req,res){
    res.render('error');
}