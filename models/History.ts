import mongoose, { Schema, models, model } from "mongoose";

const HistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["SMS", "URL", "QR", "IMAGE"],
    },

    input: {
      type: String,
      required: true,
    },

    result: {
      type: String,
      required: true,
      enum: ["SAFE", "SCAM", "SUSPICIOUS"],
    },

    confidence: {
      type: Number,
      default: 0,
    },

    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const History = models.History || model("History", HistorySchema);

export default History;