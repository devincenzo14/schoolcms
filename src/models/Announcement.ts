import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncementDocument extends Document {
  title: string;
  content: string;
  images: string[];
  category: "All" | "Nursery" | "Kinder" | "Preschool";
  isPublished: boolean;
  scheduledAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncementDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, enum: ["All", "Nursery", "Kinder", "Preschool"], default: "All" },
    isPublished: { type: Boolean, default: false },
    scheduledAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Announcement: Model<IAnnouncementDocument> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncementDocument>("Announcement", AnnouncementSchema);

export default Announcement;
