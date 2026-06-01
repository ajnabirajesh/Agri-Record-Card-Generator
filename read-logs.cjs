const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = collection(db, 'payment_logs');
  const snap = await getDocs(q);
  console.log("Total logs:", snap.size);
  snap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
run().catch(console.error);
