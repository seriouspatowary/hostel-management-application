import { Schema, model, models, Document } from "mongoose";

export interface IAllocateRoom extends Document {
  boarderId: Schema.Types.ObjectId;
  hostelId: Schema.Types.ObjectId;
  roomId: Schema.Types.ObjectId;
  roomNo: string;
  seatNumber: string; // ✅ NEW FIELD
  isAllocate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AllocateRoomSchema = new Schema<IAllocateRoom>(
  {
    boarderId: {
      type: Schema.Types.ObjectId,
      ref: "HostelBoarder",
      required: true,
    },
    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    roomNo: {
      type: String,
      required: true,
      trim: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isAllocate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate allocation for same boarder
AllocateRoomSchema.index({ boarderId: 1 }, { unique: true });

const AllocateRoom =
  models.AllocateRoom ||
  model<IAllocateRoom>("AllocateRoom", AllocateRoomSchema);

export default AllocateRoom;
