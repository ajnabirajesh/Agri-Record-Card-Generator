const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backfill() {
  const cardsRef = db.collection("cards");
  const snapshot = await cardsRef.get();
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.farmerId || !data.mobileNumber || !data.aadhaarNumber) {
      if (data.farmerData) {
        try {
          const parsedData = typeof data.farmerData === "string" ? JSON.parse(data.farmerData) : data.farmerData;
          if (parsedData.farmerId || parsedData.mobile || parsedData.phone || parsedData.aadhaar) {
            await doc.ref.update({
              farmerId: parsedData.farmerId || "",
              mobileNumber: parsedData.mobile || parsedData.phone || "",
              aadhaarNumber: parsedData.aadhaar || ""
            });
            updatedCount++;
            console.log(`Updated doc ${doc.id}`);
          }
        } catch (e) {
          console.error(`Error parsing farmerData for ${doc.id}: ${e.message}`);
        }
      }
    }
  }

  console.log(`Backfill complete. Updated ${updatedCount} documents.`);
  process.exit(0);
}

backfill();
