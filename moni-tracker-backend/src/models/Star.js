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
      default: null,
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

starSchema.index(
  { userId: 1, legacyEntryId: 1 },
  {
    unique: true,
    sparse: true,
  }
);

export default mongoose.model("Star", starSchema);