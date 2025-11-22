import { Request, Response } from 'express';
import { Order, IOrder } from '../models/order.model';

export class OrderController {

    static async create(req: Request, res: Response) {
        try {
            const order = new Order(req.body as Partial<IOrder>);
            await order.save();
            res.status(201).json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const orders = await Order.find().sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) return res.status(404).json({ success: false, message: 'order not found' });
            res.status(200).json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const order = await Order.findByIdAndUpdate(
                req.params.id,
                req.body as Partial<IOrder>,
                { new: true }
            );
            if (!order) return res.status(404).json({ success: false, message: 'order not found' });
            res.status(200).json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const order = await Order.findByIdAndDelete(req.params.id);
            if (!order) return res.status(404).json({ success: false, message: 'order not found' });
            res.status(200).json({ success: true, data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }
}
