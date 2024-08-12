// // services/TwilioService.js
// const axios = require('axios');

// class TwilioService {
//   constructor() {
//     this.accountSid = process.env.TWILIO_ACCOUNT_SID;
//     this.authToken = process.env.TWILIO_AUTH_TOKEN;
//     this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
//     this.baseUrl = 'https://verify.twilio.com/v2/Services/';
//   }

//   async sendVerificationCode(phoneNumber) {
//     //converting the phone num to +972
//     const internationalNumber = convertToInternationalFormat(phoneNumber);

//     if (!internationalNumber) {
//       throw new Error('Invalid phone number provided.');
//     }

//     try {
//       const response = await axios.post(
//         `https://verify.twilio.com/v2/Services/${this.verifyServiceSid}/Verifications`,
//         {
//           To: internationalNumber,
//           Channel: 'sms',
//         },
//         {
//           auth: {
//             username: this.accountSid,
//             password: this.authToken,
//           },
//         }
//       );

//       console.log('res', response);

//       return response.data;
//     } catch (error) {
//       console.error('Error sending verification code:', error);
//       throw new Error('Error sending verification code');
//     }
//   }

//   //   async verifyCode(phoneNumber, code) {
//   //     try {
//   //       const response = await axios.post(
//   //         `${this.baseUrl}${this.verifyServiceSid}/VerificationChecks`,
//   //         {
//   //           To: phoneNumber,
//   //           Code: code,
//   //         },
//   //         {
//   //           auth: {
//   //             username: this.accountSid,
//   //             password: this.authToken,
//   //           },
//   //         }
//   //       );
//   //       return response.data;
//   //     } catch (error) {
//   //       console.error('Error verifying code:', error);
//   //       throw new Error('Error verifying code');
//   //     }
//   //   }
// }
// //function for converting 0 to +972 - israel num
// function convertToInternationalFormat(localNumber) {
//   localNumber = localNumber.replace(/\D/g, '');
//   if (localNumber.startsWith('0')) {
//     return '+972' + localNumber.substring(1);
//   }
//   return localNumber;
// }
// module.exports = new TwilioService();

const twilio = require('twilio'); // Or, for ESM: import twilio from "twilio";

//function for converting 0 to +972 - israel num
function convertToInternationalFormat(localNumber) {
  localNumber = localNumber.replace(/\D/g, '');
  if (localNumber.startsWith('0')) {
    return '+972' + localNumber.substring(1);
  }
  return localNumber;
}
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const SID = process.env.TWILIO_VERIFY_SERVICE_SID;
const client = twilio(accountSid, authToken);

async function createService() {
  try {
    const service = await client.verify.v2.services.create({
      friendlyName: 'My First Verify Service',
    });
    if (service.sid) {
      return;
    }
  } catch (error) {
    console.log('error twilo route', error);
  }
}

async function createVerification(phoneNumber) {
  const number = convertToInternationalFormat(phoneNumber);
  const verification = await client.verify.v2
    .services(SID)
    .verifications.create({
      channel: 'sms',
      to: number,
    });
  return verification;
}

async function createVerificationCheck(phoneNumber, code) {
  const number = convertToInternationalFormat(phoneNumber);

  const verificationCheck = await client.verify.v2
    .services(SID)
    .verificationChecks.create({
      code: code,
      to: number,
    });

  return verificationCheck;
}

module.exports = { createVerificationCheck, createVerification, createService };
