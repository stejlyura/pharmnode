import mongoose, { Schema, model, models } from "mongoose";

const CustomIngredientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["active", "filler", "lubricant", "glidant", "dry-binder"], 
      required: true 
    },
    casNumber: { type: String },
    looseBulkDensity: { type: Number, required: true },
    tappedBulkDensity: { type: Number, required: true },
    trueDensity: { type: Number },
    costPerKgUsd: { type: Number, default: 0 },
    maxSafePercentage: { type: Number, default: 100 },
    incompatibleWith: { type: [Number], default: [] },
    compatibleWith: { type: [Number], default: [] },
    isAllergen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CustomIngredient = models.CustomIngredient || model("CustomIngredient", CustomIngredientSchema);
export default CustomIngredient;
