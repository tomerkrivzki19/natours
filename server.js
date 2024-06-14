const mongoose = require('mongoose');
const dotenv = require('dotenv');

//  HOW TO HANDLE GLOBAL REJECTED PROMISES FOR SYNC CODES THAT NOT HANDALED ENYWHERE --UNCALLED ECCEPTION
// for example : console.log(x); -> x is not defind to resove that kind of errors
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXEPTION! 💣, Shutting down.... ');
  console.log(err.name, err.message);
  process.exit(1);
  // server.close(() => { //We cannot use the server verible , becouse it called in the end , and we need this callback function readed first becouse ig there and err before the code readed the calllback wiwll not work
  //   // in this method , ther server will get more time to handle all the reqeust that been handled at the time , and inly after that the server will shut down
  //   process.exit(1);
  // });
});
//console.log(x);--> the example for testing the function

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // UseNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection succseful');
  })
  .catch((err) => {
    console.log(err, 'connnection to mongoDB failed');
  });

// Example to creating a document :

// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//     console.log('documnet is passed susscefuly');
//   })
//   .catch((err) => {
//     console.log('ERR 💥:', err);
//   });
// //////////////////////////////////////////////////////
// console.log(process.env); ---> give us the enviroment option that we current on inside node.js enviroment calss optin
const port = process.env.PORT || 4000;
//server -> for the rejected promises function , to shut down the server when thier an rejection from a server
const server = app.listen(port, () => {
  console.log(`app runing on port ${port}...`);
});

//  HOW TO HANDLE GLOBAL REJECTED PROMISES FOR ASYNC CODES
// each time there un-handled rejection  somewhere in our application the proccess object will imit an object called  'unhandleRejection ',so we can subscribe to that event
process.on('unhandledRejection', (err) => {
  //in here will be all the unhandled promises (rejected promises) ---> "Saftey Net"

  //if there an problem like a database connection then our application not woek at all , so what we need to do here is to shout down our application
  console.log('UNHANDLE REJECTION! 💣, Shutting down.... ');
  console.log(err.name, err.message);
  server.close(() => {
    // in this method , ther server will get more time to handle all the reqeust that been handled at the time , and inly after that the server will shut down
    process.exit(1);
  });
  //we have to types -> code 0 -> stand for success , code 1 => stand for uncuse acception
});

//PROOCCESS.ON()--EPXPLATION
//! after uncaught exeption we need to crash our application becouse the entire node proccess is in so called an uncleand state, to dix that the procees need to termined and then restarted
//- in production we should have then a tool in place that will restart the apllication after crashing

//in node.js this way of two unction that catch error and handled in not a good practic becouse we need to handle the problem inside the funciton that it accured, with catch method , and not realy on the callback function that we have made
