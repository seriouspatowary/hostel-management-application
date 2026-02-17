import { Schema, model, models, Document } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Admin = models.Admin || model<IAdmin>('Admin', AdminSchema);

export default Admin;
