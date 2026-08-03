import mongoose, { Schema, models, model } from "mongoose";

const HistorySchema = new Schema(
  {
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

export default models.History || model("History", HistorySchema);