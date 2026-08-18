// import twilio from "twilio";

const accountSid = process.env.TWILIO_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE!;

// const client = twilio(accountSid, authToken);

export const SMSService = {
  async sendSMS(to: string, body: string) {
    // await client.messages.create({
    //   body,
    //   from: fromNumber,
    //   to,
    // });
  },
};
