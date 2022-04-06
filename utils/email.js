const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url, token) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
    this.token = token;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1) Render HTML based on a pug template
    // basically create html out of the template so that we can then send that HTML as the email
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstname,
      url: this.url,
      subject,
      token: this.token,
    });
    //2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html), // convert the HTML to the simple text
      // html:
    };
    //3) Create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes）'
    );
  }
};

// const sendEmail = async (options) => {
//   //1) Create a transporter
//   const transporter = nodeMailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },

//     //Activate in gmail "less secure app" option
//   });
//   //2) Define the email option
//   const mailOptions = {
//     from: 'kienYiep <hello@kienyiep.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };
//   //3) Actually send the email
//   // this is asynchronous and will return promise
//   await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;
