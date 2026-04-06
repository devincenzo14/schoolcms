import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "principal" | "teacher" | "student";
  // Student personal info (from application form)
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  age?: number;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  gradeLevel?: string;
  parentGuardianName?: string;
  parentGuardianRelationship?: string;
  contactNumber?: string;
  previousSchool?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "principal", "teacher", "student"],
      default: "teacher",
    },
    // Student personal info fields
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    middleName: { type: String, trim: true, default: "" },
    suffix: { type: String, trim: true, default: "" },
    age: { type: Number, min: 0, max: 100 },
    dateOfBirth: { type: Date },
    gender: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    gradeLevel: { type: String, trim: true, default: "" },
    parentGuardianName: { type: String, trim: true, default: "" },
    parentGuardianRelationship: { type: String, trim: true, default: "" },
    contactNumber: { type: String, trim: true, default: "" },
    previousSchool: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
