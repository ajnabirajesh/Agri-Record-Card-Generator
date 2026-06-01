import crypto from "crypto";

async function testWebhook() {
  const secret = "agri_record_card_webhook_2026_secret";
  const body = {
    event: "payment.failed",
    payload: { payment: { entity: { id: "pay_test", amount: 100, email: "test@example.com" } } }
  };
  
  const bodyStr = JSON.stringify(body);
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(bodyStr);
  const signature = hmac.digest("hex");
  
  const res = await fetch("https://agri-record-card-generator.vercel.app/api/razorpay-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature
    },
    body: bodyStr
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

testWebhook().catch(console.error);
