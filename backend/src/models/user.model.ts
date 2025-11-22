import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "shop" | "distributor" | "factory" | "admin";
    location?: string;
    contactNumber?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["shop", "distributor", "factory", "admin"], required: true },
        location: { type: String },
        contactNumber: { type: String },
        profileImage: { type: String },
    },
    {
        timestamps: true, // <-- this adds createdAt and updatedAt
    }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
