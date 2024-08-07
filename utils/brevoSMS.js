const axios = require('axios');

module.exports = class BrevoSMS {
  constructor(apiKey, senderID) {
    this.apiKey = apiKey;
    this.senderID = senderID;
    this.apiUrl = 'https://api.brevo.com/v3/transactionalSMS/sms';
  }

  async sendSms(recipient, message) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          sender: this.senderID,
          recipient: recipient,
          content: message,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('SMS sent:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Error sending SMS:',
        error.response ? error.response.data : error.message
      );
      throw error; // Rethrow error for handling by caller if needed
    }
  }
};
