import { WhatsAppService } from "./whatsapp.service";
import { SMSService } from "./sms.service";
import { EmailService } from "./email.service";

export const CommunicationService = {
  sendWhatsAppTemplate: WhatsAppService.sendTemplateMessage,
  sendSMS: SMSService.sendSMS,
  sendEmail: EmailService.sendMail,
};
