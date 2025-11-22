import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        category: { type: String, required: true },
    },
    { timestamps: true }
);

export const Product = model<IProduct>('Product', productSchema);
