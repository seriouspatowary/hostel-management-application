import { Schema, model, models, Document } from "mongoose";

export interface IRoom extends Document {
  hostelId: Schema.Types.ObjectId;
  roomNo: string;
  seatAllocate: number;
  seatNumbers: Record<string, number>;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    roomNo: {
      type: String,
      required: true,
      trim: true,
    },
    seatAllocate: {
      type: Number,
      required: true,
      min: 0,
    },
    seatNumbers: {
      type: Map,
      of: Number, // 0 = vacant, 1 = booked
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Room = models.Room || model<IRoom>("Room", RoomSchema);

export default Room;
