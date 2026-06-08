import mongoose, { Schema, model, models } from "mongoose";

const RecipeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    nodes: { type: Array, default: [] },
    connections: { type: Array, default: [] },
  },
  { timestamps: true }
);

export const Recipe = models.Recipe || model("Recipe", RecipeSchema);
export default Recipe;
