import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICarouselDocument extends Document {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const CarouselSchema = new Schema<ICarouselDocument>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true },
    buttonText: { type: String, default: "", trim: true },
    buttonLink: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Carousel: Model<ICarouselDocument> =
  mongoose.models.Carousel ||
  mongoose.model<ICarouselDocument>("Carousel", CarouselSchema);

export default Carousel;
