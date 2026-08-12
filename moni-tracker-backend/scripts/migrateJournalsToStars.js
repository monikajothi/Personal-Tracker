import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "../src/config/db.js";
import Entry from "../src/models/Entry.js";
import Star from "../src/models/Star.js";

dotenv.config();

const DEFAULT_STAR_COLOR = "pink";

function dateToDate(dateString) {
  // YYYY-MM-DD → local-ish UTC date
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

async function migrateJournalsToStars() {
  try {
    await connectDB();

    console.log("🌱 Connected to MongoDB");
    console.log("✨ Starting journal → star migration...\n");

    const entries = await Entry.find({
      "categories.journal": { $exists: true },
    }).lean();

    console.log(`📚 Found ${entries.length} entries containing journals.\n`);

    let migrated = 0;
    let skipped = 0;
    let empty = 0;

    for (const entry of entries) {
      const journal = entry.categories?.journal;

      if (!journal) {
        empty++;
        continue;
      }

      const text = typeof journal.text === "string"
        ? journal.text.trim()
        : "";

      const photo = journal.photo || null;

      // Ignore completely empty journal entries
      if (!text && !photo) {
        empty++;
        continue;
      }

      // Don't migrate the same Entry twice
      const alreadyMigrated = await Star.findOne({
        userId: entry.userId,
        legacyEntryId: entry._id,
      }).lean();

      if (alreadyMigrated) {
        skipped++;
        console.log(
          `⏭️ Already migrated: ${entry.date}`
        );
        continue;
      }

      const star = await Star.create({
        userId: entry.userId,

        text:
          text ||
          "A little moment I wanted to remember. ✨",

        color: DEFAULT_STAR_COLOR,

        // Keep the existing journal photo exactly as it is.
        photoUrl: photo,

        legacyEntryId: entry._id,

        // Preserve the original journal date.
        createdAt: dateToDate(entry.date),
      });

      migrated++;

      console.log(
        `⭐ Migrated ${entry.date} → ${star._id}`
      );
    }

    console.log("\n────────────────────────────");
    console.log("✨ Migration complete!");
    console.log("────────────────────────────");
    console.log(`⭐ Migrated : ${migrated}`);
    console.log(`⏭️ Skipped   : ${skipped}`);
    console.log(`🌱 Empty     : ${empty}`);
    console.log(`📚 Total     : ${entries.length}`);
    console.log("────────────────────────────\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);

    await mongoose.connection.close();
    process.exit(1);
  }
}

migrateJournalsToStars();
