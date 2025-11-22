import { Schema, model, Document } from 'mongoose';

export interface IOrder extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

// const OrderSchema = new Schema<IOrder>(
//     {
//         name: { type: String, required: true, trim: true },
//         description: { type: String, required: true, trim: true },
//         price: { type: Number, required: true },
//         stock: { type: Number, required: true, default: 0 },
//         category: { type: String, required: true },
//     },
//     { timestamps: true }
// );

const OrderSchema = new Schema(
    {
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }, // snapshot price
            },
        ],

        totalPrice: {
            type: Number,
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },

        shippingAddress: {
            fullName: { type: String },
            phone: { type: String },
            region: { type: String },
            city: { type: String },
            specificAddress: { type: String },
        },

        transactionId: {
            type: String, // for Chapa, Stripe, Telebirr…etc
        },
    },
    { timestamps: true }
);


export const Order = model<IOrder>('order', OrderSchema);
