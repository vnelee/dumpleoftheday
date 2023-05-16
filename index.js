const express = require('express');
const app = express();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  database: process.env.RDS_DATABASE
})

// /characters - list of character names
// /characters/:id - character name, info + images they appear in

app.get('/characters', (req,res) => {
  const sqlAllCharactersGet = 'SELECT * FROM characters';
  // db.query(sqlAllCharactersGet, (err,result) => {
  //   res.send(result);
  //   console.log(result);
  // });
});

app.get('/characters/:id', (req, res) => {
  const {id} = req.params.id;
  const sqlCharacterGet = 'SELECT * FROM characters WHERE character_id=?';
  const ret = {};
  // db.query(sqlCharacterGet, id, (err,result) => {
  //   console.log(result);
  // });
});