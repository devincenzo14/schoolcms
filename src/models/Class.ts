import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClassDocument extends Document {
  name: string;
  section: string;
  teacherId: mongoose.Types.ObjectId;
  subject: string;
  students: mongoose.Types.ObjectId[];
  schedule: string;
  createdAt: Date;
}

const ClassSchema = new Schema<IClassDocument>(
  {
    name: { type: String, required: true, trim: true },
    section: { type: String, trim: true, default: "" },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    schedule: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const Class: Model<IClassDocument> =
  mongoose.models.Class ||
  mongoose.model<IClassDocument>("Class", ClassSchema);

export default Class;
