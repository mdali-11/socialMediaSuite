import axios from "axios";
import MessageLog from "../models/MessageLog.js";

export const sendReply = async ({ phoneNumberId, accessToken, to, message, incomingMessage = "" }) => {
  console.log("phnenumber" , phoneNumberId , accessToken , to , message , incomingMessage)
  try {
     const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    let res = await axios.post(url, {
      messaging_product: "whatsapp",
      to,
      text: { body: message }
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    console.log("resss" , res)

    await MessageLog.create({
      platform: "whatsapp",
      senderId: to,
      message: incomingMessage || "",
      reply: message
    });
  } catch (error) {
    console.log("WhatsApp Send Error:", error.response?.data || error.message);
  }
};
