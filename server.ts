import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Twilio Client
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  let twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER?.trim().replace(/\s/g, '');
  
  // Ensure the number starts with + and has a country code
  if (twilioPhoneNumber && !twilioPhoneNumber.startsWith('+')) {
    // If it's a 10-digit number, it's likely missing a country code
    if (twilioPhoneNumber.length === 10) {
      console.warn(`Twilio Warning: TWILIO_PHONE_NUMBER (${twilioPhoneNumber}) appears to be a 10-digit number missing a country code. Prepending '+91' (India) as a guess, but please update Settings with the full country code.`);
      twilioPhoneNumber = '+91' + twilioPhoneNumber;
    } else {
      twilioPhoneNumber = '+' + twilioPhoneNumber;
    }
  }

  const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

  // API Routes
  app.post("/api/make-call", async (req, res) => {
    const { phoneNumber, message, language } = req.body;

    if (!client || !twilioPhoneNumber) {
      return res.status(500).json({ error: "Twilio not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in Settings." });
    }

    try {
      // Twilio <Say> supports Marathi (mr-IN)
      const voice = 'Polly.Aditi'; // Aditi supports Hindi/Marathi/English
      const twimlLanguage = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';

      const call = await client.calls.create({
        twiml: `<Response><Say language="${twimlLanguage}" voice="${voice}">${message}</Say></Response>`,
        to: phoneNumber,
        from: twilioPhoneNumber,
      });

      res.json({ success: true, callSid: call.sid });
    } catch (error: any) {
      console.error("Twilio Error:", error);
      let errorMessage = error.message;
      
      if (error.code === 21210) {
        const isLikelyMissingCountryCode = twilioPhoneNumber && twilioPhoneNumber.length <= 11;
        errorMessage = `Twilio Error 21210: The 'From' number ${twilioPhoneNumber} is not verified. 
        
        👉 IMPORTANT: The 'From' number MUST be your Twilio Phone Number (e.g., +13509003002), NOT your personal number.
        ${isLikelyMissingCountryCode ? '\n👉 ALSO: Your number looks like it is missing a country code (e.g., +91 for India). Please update TWILIO_PHONE_NUMBER in Settings.' : ''}
        
        1. If ${twilioPhoneNumber} is your personal number, you are using the wrong number in TWILIO_PHONE_NUMBER settings. Use your Twilio number instead.
        2. If you want to use a personal number as the 'From' number, you MUST verify it at https://console.twilio.com/us1/develop/phone-numbers/verified-caller-ids
        3. If this is a Twilio number you bought, ensure it is active at https://console.twilio.com/us1/develop/phone-numbers/manage/incoming`;
      } else if (error.code === 21608) {
        errorMessage = `Twilio Error 21608: Trial Account limit. You can only call VERIFIED numbers. 
        Please verify the recipient number (${phoneNumber}) at https://console.twilio.com/us1/develop/phone-numbers/verified-caller-ids`;
      }
      
      res.status(500).json({ error: errorMessage, code: error.code });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
