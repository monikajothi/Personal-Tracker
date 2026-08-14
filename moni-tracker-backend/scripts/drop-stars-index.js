#!/usr/bin/env node
import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set. Run: MONGO_URI=your_conn node scripts/drop-stars-index.js");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;

    // Try to drop the old index if it exists
    const indexes = await db.collection("stars").indexes();
    const idx = indexes.find((i) => i.name === "userId_1_legacyEntryId_1");
    if (idx) {
      console.log("Found old index 'userId_1_legacyEntryId_1' — dropping...");
      await db.collection("stars").dropIndex("userId_1_legacyEntryId_1");
      console.log("Dropped index successfully.");
    } else {
      console.log("Old index not found — nothing to drop.");
    }

    // Optional: unset legacyEntryId fields that are explicitly null
    const res = await db.collection("stars").updateMany({ legacyEntryId: null }, { $unset: { legacyEntryId: "" } });
    if (res.modifiedCount > 0) {
      console.log(`Unset legacyEntryId on ${res.modifiedCount} documents.`);
    } else {
      console.log("No documents had legacyEntryId:null.");
    }

    console.log("Done. Restart your backend to allow mongoose to create the new index.");
  } catch (err) {
    console.error("Error while dropping index:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
