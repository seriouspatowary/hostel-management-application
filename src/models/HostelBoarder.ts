import { Schema, model, models, Document } from "mongoose";

export interface IHostelBoarder extends Document {
  name: string;
  email: string;
  dob: string;
  phone: string;
  photo?: string;
  aadharCard?: string;
  isStudent: "yes" | "no";
  organisation?: string;
  parentName: string;
  parentNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const HostelBoarderSchema = new Schema<IHostelBoarder>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    dob: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    photo: {
      type: String // store base64 or image URL
    },
    aadharCard: {
      type: String // store base64 or image URL
    },
    isStudent: {
      type: String,
      enum: ["yes", "no"],
      required: true
    },
    organisation: {
      type: String,
      trim: true
    },
    parentName: {
      type: String,
      required: true,
      trim: true
    },
    parentNumber: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const HostelBoarder =
  models.HostelBoarder || model<IHostelBoarder>("HostelBoarder", HostelBoarderSchema);

export default HostelBoarder;
