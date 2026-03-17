import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create({
      amount: 0000,
      currency: "INR",
      receipt: "receipt_order_1",
    });

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}