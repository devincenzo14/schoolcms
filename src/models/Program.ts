import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgramDocument extends Document {
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
}

const ProgramSchema = new Schema<IProgramDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Program: Model<IProgramDocument> =
  mongoose.models.Program ||
  mongoose.model<IProgramDocument>("Program", ProgramSchema);

export default Program;
