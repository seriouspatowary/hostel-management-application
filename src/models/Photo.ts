import { Schema, model, models, Document } from "mongoose";

export interface IPhoto extends Document {
  photoUrl: string;
  duration: number;
  active: number; // 1 = active, 0 = inactive
  createdAt?: Date;
  updatedAt?: Date;
}

const PhotoSchema = new Schema<IPhoto>(
  {
    photoUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    active: { type: Number, default: 1 }
  },
  {
    timestamps: true
  }
);

const Photo = models.Photo || model<IPhoto>("Photo", PhotoSchema);

export default Photo;
