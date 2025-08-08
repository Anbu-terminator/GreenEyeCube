import axios from "axios";

// EmailJS configuration - these would typically come from environment variables
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "default_service";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "default_template";
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "default_key";

export async function sendRainAlert(email: string, message: string, subject: string): Promise<void> {
  try {
    // Using EmailJS REST API to send email
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          subject: subject,
          message: message,
          from_name: "Green Eye Cube",
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.status !== 200) {
      throw new Error(`EmailJS API returned status ${response.status}`);
    }

    console.log("Rain alert sent successfully to:", email);
  } catch (error) {
    console.error("Error sending rain alert:", error);
    throw new Error("Failed to send rain alert email");
  }
}
