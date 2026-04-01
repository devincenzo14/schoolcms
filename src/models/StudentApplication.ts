import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudentApplicationDocument extends Document {
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  age: number;
  dateOfBirth: Date;
  gender: string;
  address: string;
  gradeLevel: string;
  parentGuardianName: string;
  parentGuardianRelationship: string;
  contactNumber: string;
  email?: string;
  previousSchool?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const StudentApplicationSchema = new Schema<IStudentApplicationDocument>(
  {
    lastName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: "" },
    suffix: { type: String, trim: true, default: "" },
    age: { type: Number, required: true, min: 3, max: 25 },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    gradeLevel: { type: String, required: true, trim: true },
    parentGuardianName: { type: String, required: true, trim: true },
    parentGuardianRelationship: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    previousSchool: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const StudentApplication: Model<IStudentApplicationDocument> =
  mongoose.models.StudentApplication ||
  mongoose.model<IStudentApplicationDocument>(
    "StudentApplication",
    StudentApplicationSchema
  );

export default StudentApplication;
