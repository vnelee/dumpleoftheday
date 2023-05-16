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

// /iotd/:[yyyy-mm-dd] - picture + caption, characters etc for date
// /iotd - ^ but today (central time?)
// /iotd?start_date= - list of image entries since start_date
// /iotd?end_date= - ^ since end_date
// /iotd?start_date=[]&end_date=[] - date range

test = new Date()
console.log(test)

const imgHost = ''
const datePattern = /^\d{4}[\-]\d{2}[\-]\d{2}$/

const getTodayCentral = () => {
  const dateToday = new Date();

  // todayCentralArr is in ['DD', 'MM', 'YYYY'] format.
  // Using en-GB rather than en-US takes care of
  // adding zeros for single digit month/days.
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

  // Is it before the first date, 2023-05-15 TODO change to whatever first date
  const firstDate = new Date('2023-05-15');
  if(inputDate < firstDate){
    return false;
  }

  // Is it after today

 return true;
};

app.get('/imgoftheday', (req, res) => {
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;
  console.log(startDate)
  console.log(endDate)
  /*
  if start and end date
    validate
    create query string
    execute query
  just start date
    validate; query
  just end date
    validate; query
  today (no query)
    getTodayCentral
    query
  */
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
      .send('Invalid date. Date must be between [TODO PUT START DATE :)] and [generate today]')
  }

  const {date} = dateString;
  const sqlImgDateGet = 'SELECT * FROM images WHERE date_key=?';
});

app.get('/images/:id', () => {
  const id = req.params.id;
  const sqlImgIdGet = 'SELECT * FROM images WHERE image_id=?';
})

app.listen(3000, () => {
  console.log('running');
})

