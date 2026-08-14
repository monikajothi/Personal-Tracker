import mongoose from "mongoose";

const starSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    color: {
      type: String,
      required: true,
      enum: ["pink", "sage", "blue", "yellow", "purple"],
      default: "pink",
    },

    photoUrl: {
      type: String,
      default: null,
    },

    // Original Entry document from which this star came.
    // Prevents the same journal from being migrated twice.
    legacyEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entry",
      // Do not default to null so the field is absent when not set.
      // This prevents null values from being indexed and causing
      // duplicate-key conflicts for the unique compound index.
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the unique constraint only applies when `legacyEntryId` is
// present and not null. This avoids duplicate-key errors when many
// stars are created without a legacyEntryId.
starSchema.index(
  { userId: 1, legacyEntryId: 1 },
  {
    unique: true,
  }
);

export default mongoose.model("Star", starSchema);