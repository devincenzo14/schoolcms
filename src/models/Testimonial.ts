import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonialDoc extends Document {
  name: string;
  role: string;
  content: string;
  imageUrl: string;
  rating: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial ||
  mongoose.model<ITestimonialDoc>("Testimonial", TestimonialSchema);
