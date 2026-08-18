import axios from "axios";

const WHATSAPP_API_URL =
  "https://graph.facebook.com/v18.0/<your_phone_number_id>/messages";
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const WhatsAppService = {
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string = "en_US",
    components: any[] = []
  ) {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components,
      },
    };

    const headers = {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    };

    await axios.post(WHATSAPP_API_URL, payload, { headers });
  },
};
