import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGradeDocument extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subject: string;
  score: number;
  term: "1st" | "2nd" | "3rd" | "4th" | "final";
  remarks: string;
  createdAt: Date;
}

const GradeSchema = new Schema<IGradeDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    term: {
      type: String,
      enum: ["1st", "2nd", "3rd", "4th", "final"],
      required: true,
    },
    remarks: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

GradeSchema.index({ studentId: 1, subject: 1, term: 1 });

const Grade: Model<IGradeDocument> =
  mongoose.models.Grade ||
  mongoose.model<IGradeDocument>("Grade", GradeSchema);

export default Grade;
