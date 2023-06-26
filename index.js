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
});

const imgHost = 'https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/';
const datePattern = new RegExp(/^\d{4}[\-]\d{2}[\-]\d{2}$/);
const firstDateString = '2023-06-15';

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
  if(isNaN(Date.parse(dateString))){
    return false;
  }

  const inputDate = new Date(dateString);

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
  let character = req.query.character;
  let limit = req.query.limit;
  let offset = req.query.offset;

  if(!startDate && !endDate && !character){
    const todayDate = getTodayCentral();

    db.query(
      `SELECT
        DATE_FORMAT(dates.date_key, '%Y-%m-%d') as date,
        CONCAT('${imgHost}', images.url) as url,
        images.image_caption,
        JSON_ARRAYAGG(JSON_OBJECT('character_id', characters.character_id,
                                  'character_name', characters.character_name)) as characters
      FROM dates
        INNER JOIN images ON images.image_id=dates.image_id
        INNER JOIN imageCharacter ON images.image_id=imageCharacter.image_id
        INNER JOIN characters ON imageCharacter.character_id=characters.character_id
      WHERE dates.date_key='${todayDate}';`,
      (err,result) => {
        if(err){
          return res
            .status(500);
        }
        console.log(result);
        res.send(result);
      });
    return;
  }

  if(!startDate){
    startDate = firstDateString;
  }
  else {
    if(!datePattern.test(startDate)){
      return res
        .status(400)
        .send('Invalid date. Date must be in YYYY-MM-DD format.');
    }
    validDate = validateDate(startDate);
    if(!validDate){
      return res
        .status(400)
        .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`);
    }
  }

  if(!endDate){
    endDate = getTodayCentral();
  }
  else {
    if(!datePattern.test(endDate)){
      return res
        .status(400)
        .send('Invalid date. Date must be in YYYY-MM-DD format.');
    }
    validDate = validateDate(endDate);
    if(!validDate){
      return res
        .status(400)
        .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`);
    }
  }

  if(character){
    const characterPattern = new RegExp(/^\d+[,\d+]+|^\d+$/);
    if(!characterPattern.test(character)){
      return res
        .status(400)
        .send(`Invalid character query.`);
    }
  }

  if(!limit){
    limit = 35;
  } else {
    const limPattern = new RegExp(/^\d+$/);
    if(!limPattern.test(limit)){
      return res
        .status(400)
        .send(`Invalid limit.`);
    } else if(limit > 100){
      return res
        .status(400)
        .send(`Invalid limit. Maximum limit is 100.`);
    }
  }

  if(!offset){
    offset = 0;
  } else {
    const offsetPattern = new RegExp(/^\d+$/);
    if(!offsetPattern.test(limit)){
      return res
        .status(400)
        .send(`Invalid offset.`);
    } 
  }

  db.query(
    `SELECT
      DATE_FORMAT(dates.date_key, '%Y-%m-%d') as date,
      CONCAT('${imgHost}', images.url) as url,
      images.image_caption,
      JSON_ARRAYAGG(JSON_OBJECT('character_id', characters.character_id,
                                'character_name', characters.character_name)) as characters
    FROM dates
      INNER JOIN images ON images.image_id=dates.image_id
      INNER JOIN imageCharacter ON images.image_id=imageCharacter.image_id
      INNER JOIN characters ON imageCharacter.character_id=characters.character_id
    WHERE dates.date_key BETWEEN '${startDate}' AND '${endDate}'
    ${character ?
      `AND images.image_id IN (SELECT image_id FROM imageCharacter WHERE imageCharacter.character_id IN (${character}))`
    : ''}
    GROUP BY date
    ORDER BY date ASC
    LIMIT ${limit} OFFSET ${offset};`,
    (err,result) => {
      if(err){
        return res
          .status(500);
      }
      console.log(result);
      res.send(result);
    });
  return;
});

app.get('/imgoftheday/:date', (req, res) => {
  const dateString = req.params.date;
  if(!datePattern.test(dateString)){
    return res
      .status(400)
      .send('Invalid date. Date must be in YYYY-MM-DD format.');
  }
  if(!validateDate(dateString)){
    return res
      .status(400)
      .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`);
  }

  db.query(
    `SELECT
    DATE_FORMAT(dates.date_key, '%Y-%m-%d') as date,
    CONCAT('${imgHost}', images.url) as url,
    images.image_caption,
    JSON_ARRAYAGG(JSON_OBJECT('character_id', characters.character_id,
                              'character_name', characters.character_name)) as characters
    FROM dates
      INNER JOIN images ON images.image_id=dates.image_id
      INNER JOIN imageCharacter ON images.image_id=imageCharacter.image_id
      INNER JOIN characters ON imageCharacter.character_id=characters.character_id
    WHERE dates.date_key='${dateString}';`,
    (err,result) => {
      if(err){
        return res
          .status(500);
      }
      console.log(result);
      res.send(result);
    });
  return;
});

app.listen(3000, () => {
  console.log('running');
});

