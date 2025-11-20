const axios = require("axios");

class SmsService {
    async send(phone, message) {
        const response = await axios.get("https://sms.ru/sms/send", {
        params: {
            api_id: process.env.SMS_SERVICE_API_KEY,
            to: phone,
            msg: message,
            json: 1
        }
        });

    console.log(response.data);
    }
}

module.exports = new SmsService();