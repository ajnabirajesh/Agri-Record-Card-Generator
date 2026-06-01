import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
const firebaseServerApp = initializeApp(firebaseConfig, "serverInstance");
const db = getFirestore(firebaseServerApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/razorpay-webhook", async (req, res) => {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"];

      if (webhookSecret && signature) {
        const hmac = crypto.createHmac("sha256", webhookSecret);
        hmac.update(JSON.stringify(req.body));
        const expectedSignature = hmac.digest("hex");

        if (expectedSignature !== signature) {
          return res.status(400).send("Invalid signature");
        }
      }

      const event = req.body.event;
      const payload = req.body.payload;

      await addDoc(collection(db, "payment_logs"), {
        event: event || "unknown",
        payload: JSON.stringify(payload || {}),
        createdAt: serverTimestamp(),
      });

      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-order", async (req, res) => {
    try {
      const amount = Number(req.body.amount) || 11; // amount in INR
      
      const key_id = process.env.VITE_RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_id || !key_secret) {
        return res.status(500).json({ error: "Razorpay keys are not configured" });
      }

      const instance = new Razorpay({
        key_id,
        key_secret,
      });

      const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await instance.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error.message || "Failed to create order", details: error });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
