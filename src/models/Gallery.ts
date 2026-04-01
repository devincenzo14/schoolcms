import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryDocument extends Document {
  imageUrl: string;
  caption: string;
  category: "Nursery" | "Kinder" | "Preschool";
  createdAt: Date;
}

const GallerySchema = new Schema<IGalleryDocument>(
  {
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "", trim: true },
    category: { type: String, enum: ["Nursery", "Kinder", "Preschool"], required: true, default: "Preschool" },
  },
  { timestamps: true }
);

const Gallery: Model<IGalleryDocument> =
  mongoose.models.Gallery ||
  mongoose.model<IGalleryDocument>("Gallery", GallerySchema);

export default Gallery;
