import { Request, Response } from 'express';
import { Product, IProduct } from '../models/product.model';

export class ProductController {

    static async create(req: Request, res: Response) {
        try {
            const product = new Product(req.body as Partial<IProduct>);
            await product.save();
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const products = await Product.find().sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                req.body as Partial<IProduct>,
                { new: true }
            );
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }
}
