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
  },
  {
    timestamps: true,
  }
);

starSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Star", starSchema);