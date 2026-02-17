import { Schema, model, models, Document } from "mongoose";

export interface IHostel extends Document {
  name: string;
  totalRooms: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const HostelSchema = new Schema<IHostel>(
  {
    name: { type: String, required: true, trim: true },
    totalRooms: { type: Number, required: true, min: 0 }
  },
  {
    timestamps: true
  }
);

const Hostel = models.Hostel || model<IHostel>("Hostel", HostelSchema);

export default Hostel;
