const nodemailer = require('nodemailer'); //    npm i nodemailer -> for sending messages to eamil npm  package
const pug = require('pug');
const htmlToText = require('html-to-text');

//creating a class for email sending that can take care a lot of options to send emails, for that we need to create an class that then we will use thier methods to controll types of mails we want to send to our clients
//exmaple:
//new Email(user, url).sendWelcome(); //this will going to send when a new user is sing up

module.exports = class Email {
  //sending the user we want to send the email to | sending the current url that we want to be in that email
  constructor(user, url) {
    //constructor => the function that going to be runing when a new object is created in this class
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
  }
  //METHOODS:
  //create realy easy to create easy transports for diffrent enviroments - only be conserd when sending the email
  newTransport() {
    //when we are in the pruduction we will send maild in mailstrap ,  and when we in development we will use real emails to clients mails
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid => an packege to send mails, create an trasporter to sendgrid(Brevo)
      return nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
          user: process.env.BREVO_LOGIN,
          pass: process.env.BREVO_PASSWORD,
        },
      });
    }
    //return a new nodemailer
    return nodemailer.createTransport({
      // options:
      //service: 'Gmail', // one of the services that nodemailer knew how to deal with, another examples is Yahoo,hotmail and many others
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        //authentication:
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //Activate in gmail "less secure app" option -must for sending email from your account
      //this is the link : https://mailtrap.io/
      //* we have here the option of "MAILTRAP" - basicly a fakes to send emails to real adresses, but in reality those emails get trap inside development inbox  so we can take a look how it will be later in production
    });
  }

  // this send method is a short way to the other methods that we are actually going to use as methos, this will make us the sprt cut that way we just activate that function with the dipenteses of the arguments and manage the messages that we want to use from here !
  //Send the actual email
  async send(template, subject) {
    //1) Render HTML based on a pug tamplate
    // res.render(name of the tampalte) => create the html based on the pug tamplate and render it back to the client , but we dont want to render here so  all we want to do is create the html out of the tamplate, so that we can send that html as the eamil
    const html = pug.renderFile(
      //that will take in a file and then render the pug code to a real html
      `${__dirname}/../views/email/${template}.pug`,
      {
        //data => we pass into the tamplate those veribles that way we use after that in the tampalte all the information
        //data we pass with the tamplate -> email personilation with a name and url , its like render function when we can also pass data to the tamplate same here -  this is the data that we passing to the tmaple and then implememting that in the tamplate itself
        firstname: this.firstName,
        url: this.url,
        subject,
      }
    );
    //2) Define a email options
    const mailOptions = {
      from: this.from, //name + email adress | this.from ( we set that in the constructor options above)
      to: this.to, //options ->  the actual argumnet
      subject,
      html,
      text: htmlToText.convert(html), //need to srtrip out all the html to leave only the content - for doing that we need to isntall another package named => html-to-text
    };
    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions); // returns us a promise , async function
  }

  async sendWelcome() {
    //this tamplate argument that we put first in this send fuction(method) will be a pug tamplate that we are going to build | the seconed argument will be the subject we want to send to the client
    await this.send('welcome', 'Welcome to the Natours Family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
