import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettingsDocument extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettingsDocument> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettingsDocument>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
