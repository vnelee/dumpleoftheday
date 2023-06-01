const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

app.use(cors());

const db = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  database: process.env.RDS_DATABASE
})

const imgHost = 'https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/';
const datePattern = /^\d{4}[\-]\d{2}[\-]\d{2}$/;
const firstDateString = '2023-05-15'; //TODO change this when finalized

const getTodayCentral = () => {
  const dateToday = new Date();

  // todayCentralArr is in ['DD', 'MM', 'YYYY'] format.
  // Using en-GB rather than en-US takes care of
  // including leading zeros for single digit month/days.
  const todayCentralArr = dateToday.toLocaleDateString('en-GB', {timeZone: 'America/Chicago'}).split('/');
  const todayCentral = todayCentralArr.reverse().join('-');
  return todayCentral;
};

const validateDate = (dateString) => {

  // Does the date make no sense
  if(isNaN(Date.parse(dateString))) {
    return false;
  }

  const inputDate = new Date(dateString)

  // Is it before the first date
  const firstDate = new Date(firstDateString);
  if(inputDate < firstDate){
    return false;
  }

  // Is it after today
  const todayCentral = getTodayCentral();
  const todayCentralDate = new Date(todayCentral);
  if(inputDate > todayCentralDate){
    return false;
  }

 return true;
};

app.get('/imgoftheday', (req, res) => {
  let startDate = req.query.start_date;
  let endDate = req.query.end_date;

  if(!startDate && !endDate){
    console.log('here')
    const todayDate = getTodayCentral();
    console.log(todayDate)
    db.query(`SELECT DATE_FORMAT(dates.date_key, '%Y-%m-%d') as date, CONCAT('${imgHost}', images.url) as url, images.image_caption,
    JSON_ARRAYAGG(JSON_OBJECT('character_id', characters.character_id, 'character_name', characters.character_name)) as characters
      FROM dates
        INNER JOIN images
          ON images.image_id=dates.image_id
        INNER JOIN imageCharacter
          ON images.image_id=imageCharacter.image_id
        INNER JOIN characters
          ON imageCharacter.character_id=characters.character_id
      WHERE dates.date_key=?;`,
    todayDate,
    (err,result) => {
      if(err){
        console.log(err);
      }
      console.log(result);
      res.send(result);
    })
  }

  if(!startDate){
    startDate = firstDateString;
  }
  else {
    if(!startDate.match(datePattern)){
      return res
        .status(400)
        .send('Invalid format. Date must be in YYYY-MM-DD format.')
    }
    validDate = validateDate(startDate);
    if(!validDate){
      return res
        .status(400)
        .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`)
    }
  }

  if(!endDate){
    endDate = getTodayCentral();
  }
  else {
    if(!endDate.match(datePattern)){
      return res
        .status(400)
        .send('Invalid format. Date must be in YYYY-MM-DD format.')
    }
    validDate = validateDate(endDate);
    if(!validDate){
      return res
        .status(400)
        .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`)
    }
  }

  db.query(`SELECT DATE_FORMAT(dates.date_key, '%Y-%m-%d') as date, CONCAT('${imgHost}', images.url) as url, images.image_caption,
  JSON_ARRAYAGG(JSON_OBJECT('character_id', characters.character_id, 'character_name', characters.character_name)) as characters
    FROM dates
      INNER JOIN images
        ON images.image_id=dates.image_id
      INNER JOIN imageCharacter
        ON images.image_id=imageCharacter.image_id
      INNER JOIN characters
        ON imageCharacter.character_id=characters.character_id
    WHERE dates.date_key BETWEEN ? AND ?
    GROUP BY date
    LIMIT 35;`,
  [startDate, endDate],
  (err,result) => {
    if(err){
      console.log(err);
    }
    console.log(result);
    res.send(result);
  })

});

app.get('/imgoftheday/:date', (req, res) => {
  const dateString = req.params.date;
  if(!dateString.match(datePattern)){
    return res
      .status(400)
      .send('Invalid format. Date must be in YYYY-MM-DD format.')
  }
  if(!validateDate(dateString)){
    return res
      .status(400)
      .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`)
  }

  db.query(`SELECT DATE_FORMAT(dates.date_key, '%Y-%m-%d') as date, CONCAT('${imgHost}', images.url) as url, images.image_caption,
  JSON_ARRAYAGG(JSON_OBJECT('character_id', characters.character_id, 'character_name', characters.character_name)) as characters
    FROM dates
      INNER JOIN images
        ON images.image_id=dates.image_id
      INNER JOIN imageCharacter
        ON images.image_id=imageCharacter.image_id
      INNER JOIN characters
        ON imageCharacter.character_id=characters.character_id
    WHERE dates.date_key=?;`,
  dateString,
  (err,result) => {
    if(err){
      console.log(err);
    }
    console.log(result);
    res.send(result);
  })
});

app.listen(3000, () => {
  console.log('running');
})

