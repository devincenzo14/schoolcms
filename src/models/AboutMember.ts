import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAboutMemberDocument extends Document {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  type: "founder" | "teacher";
  order: number;
  createdAt: Date;
}

const AboutMemberSchema = new Schema<IAboutMemberDocument>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    type: { type: String, enum: ["founder", "teacher"], required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AboutMember: Model<IAboutMemberDocument> =
  mongoose.models.AboutMember ||
  mongoose.model<IAboutMemberDocument>("AboutMember", AboutMemberSchema);

export default AboutMember;
