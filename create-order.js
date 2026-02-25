import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: 2100, // ₹21 (amount in paise)
      currency: "INR",
      receipt: "receipt_order_1",
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
