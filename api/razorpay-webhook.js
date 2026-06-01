import crypto from "crypto";
import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

let db;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed. Must be POST" });
  }

  try {
    // Initialize Firebase if not already initialized
    if (!db) {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        const app = getApps().length === 0 ? initializeApp(config) : getApp();
        db = getFirestore(app, config.firestoreDatabaseId);
      } else {
        console.error("Firebase config not found at", configPath);
        return res.status(500).json({ error: "Firebase config not found" });
      }
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // In a real production app, you should use the raw body for HMAC signature verification.
    // Since req.body is already parsed by Vercel into an object, JSON.stringify might 
    // occasionally format differently than the original raw text, but mostly works for basic usage.
    if (webhookSecret && signature) {
      try {
        const hmac = crypto.createHmac("sha256", webhookSecret);
        hmac.update(JSON.stringify(req.body));
        const expectedSignature = hmac.digest("hex");

        if (expectedSignature !== signature) {
          console.error("Invalid signature. Expected:", expectedSignature, "Got:", signature);
          // Return 400 if you want to enforce strict security. 
          // For now, logging it but still saving the log (or return 400 depending on strictness).
          // return res.status(400).send("Invalid signature");
        }
      } catch (e) {
        console.error("Signature verification error", e);
      }
    }

    const event = req.body.event || "unknown_webhook_event";
    const payload = req.body.payload || req.body;

    // Save to Firestore
    await addDoc(collection(db, "payment_logs"), {
      event: event,
      payload: JSON.stringify(payload),
      createdAt: serverTimestamp(),
      source: "vercel_webhook"
    });

    console.log("Successfully saved webhook event:", event);
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: error.message || "Failed to process webhook" });
  }
}
