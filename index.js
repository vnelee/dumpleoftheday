/********** Load modules and setup app **********/

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  database: process.env.RDS_DATABASE,
});


/********** Global variables **********/

const imgHost = 'https://dumpleandfriends-pics.s3.us-east-2.amazonaws.com/'; // Base url for images
const datePattern = new RegExp(/^\d{4}[\-]\d{2}[\-]\d{2}$/); // Regex to check for YYYY-MM-DD date pattern
const firstDateString = '2023-09-15'; // Earliest valid date


/********** Helper functions **********/

/**
 * @function getTodayCentral()
 *
 * @description Get the current date in the US Central Time Zone.
 * Assumptions: None
 * 
 * @return {string} Date in 'YYYY-MM-DD' format
 *
 */
const getTodayCentral = () => {
  const dateToday = new Date();

  // Using en-GB rather than en-US takes care of
  // including leading zeros for single digit month/days.
  const todayCentralArr = dateToday.toLocaleDateString('en-GB', {timeZone: 'America/Chicago'}).split('/');

  // todayCentralArr is in ['DD', 'MM', 'YYYY'] format
  const todayCentral = todayCentralArr.reverse().join('-');

  return todayCentral;
};

/**
 * @function validateDate()
 *
 * @description Determines if the given date is valid.
 * Assumptions: Input has already been verified for proper 'YYYY-MM-DD'
 *              formatting before this function is called
 * 
 * @param {string} Date in 'YYYY-MM-DD' format
 * @return {bool} true = valid, false = not valid
 *
 */
const validateDate = (dateString) => {

  // Is it not a real calendar date
  if(isNaN(Date.parse(dateString))) {
    return false;
  }

  const inputDate = new Date(dateString);

  // Is it before the first date
  const firstDate = new Date(firstDateString);

  if(inputDate < firstDate) {
    return false;
  }

  // Is it after today
  const todayCentral = getTodayCentral();
  const todayCentralDate = new Date(todayCentral);

  if(inputDate > todayCentralDate) {
    return false;
  }

  return true;
};


/********** API Endpoints **********/
/* See docs on README.md for details */

/**
 * Root endpoint
 * Returns welcome message pointing to docs
 */

app.get('/', (req, res) => {
  return res
    .status(200)
    .send('Welcome to the dumpleoftheday API! To get started/learn more, ' +
          'visit the GitHub repo/docs at https://github.com/vnelee/dumpleoftheday :)');
});

/**
 * Character endpoints
 * Returns data related to characters
 */

app.get('/characters', (req, res) => {
  db.query(
    `SELECT * FROM characters;`,
    (err, result) => {
      if(err) {
        return res
          .status(500)
          .send('Internal error.');
      }
      console.log(result);
      return res
        .status(200)  
        .send(result);
    });
});

app.get('/characters/:id', (req, res) => {
  const id = req.params.id;
  const characterPattern = new RegExp(/^\d+$/);

  if(!characterPattern.test(id)) {
    return res
      .status(400)
      .send(`Invalid character query.`);
  }

  db.query(
    `SELECT * FROM characters WHERE character_id='${id}';`,
    (err, result) => {
      if(err) {
        return res
          .status(500)
          .send('Internal error.');
      }
      console.log(result);
      return res
        .status(200)
        .send(result);
    });
});

/**
 * Date endpoints
 * Returns data related to the image(s) from certain date(s)
 */

app.get('/imgoftheday', (req, res) => {
  let startDate = req.query.start_date;
  let endDate = req.query.end_date;
  const character = req.query.character;

  // No parameters - get today's image
  if(!startDate && !endDate && !character) {
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
      (err, result) => {
        if(err) {
          return res
            .status(500)
            .send('Internal error.');
        }
        console.log(result);
        return res
          .status(200)
          .send(result);
      });
  }

  // Set or validate start and end of date range to search through

  if(!startDate) {
    startDate = firstDateString;
  }
  else {
    if(!datePattern.test(startDate)) {
      return res
        .status(400)
        .send('Invalid date. Date must be in YYYY-MM-DD format.');
    }

    const validDate = validateDate(startDate);

    if(!validDate) {
      return res
        .status(400)
        .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`);
    }
  }

  if(!endDate) {
    endDate = getTodayCentral();
  }
  else {
    if(!datePattern.test(endDate)) {
      return res
        .status(400)
        .send('Invalid date. Date must be in YYYY-MM-DD format.');
    }

    const validDate = validateDate(endDate);

    if(!validDate) {
      return res
        .status(400)
        .send(`Invalid date. Date must be between ${firstDateString} and ${getTodayCentral()}`);
    }
  }

  if(character) {
    // Character parameter can be one positive integer
    // or multiple positive integers separated by commas
    const characterPattern = new RegExp(/^\d+[,\d+]+|^\d+$/);

    if(!characterPattern.test(character)) {
      return res
        .status(400)
        .send(`Invalid character query.`);
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
    ORDER BY date ASC;`,
    (err, result) => {
      if(err) {
        return res
          .status(500)
          .send('Internal error.');
      }
      console.log(result);
      return res
        .status(200)
        .send(result);
    });
});

app.get('/imgoftheday/:date', (req, res) => {
  const dateString = req.params.date;

  if(!datePattern.test(dateString)) {
    return res
      .status(400)
      .send('Invalid date. Date must be in YYYY-MM-DD format.');
  }
  if(!validateDate(dateString)) {
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
    (err, result) => {
      if(err) {
        return res
          .status(500)
          .send('Internal error.');
      }
      console.log(result);
      return res
        .status(200)
        .send(result);
    });
});


/********** Export (AWS Lambda) or connect to port (local) **********/

if(process.env.ENVIRONMENT === 'lambda') {
  module.exports.handler = serverless(app);
}
else {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
  });
}
