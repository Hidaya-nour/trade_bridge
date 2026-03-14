import { Request, Response } from 'express';
import { ProductService } from '../services/product/product.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

const productService = new ProductService();

export class ProductController {
  // Get all products (with filters)
  async getAllProducts(req: Request, res: Response) {
    try {
     const filters = {
  category: req.query.category as string | undefined,
  minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
  maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
  supplier_id: req.query.supplierId as string | undefined,
  search: req.query.search as string | undefined,
exclude_supplier_id: req.query.exclude_supplier_id as string | undefined,
  is_available:
    req.query.isAvailable !== undefined
      ? req.query.isAvailable === 'true'
      : undefined,
  page: req.query.page ? Number(req.query.page) : 1,
  limit: req.query.limit ? Number(req.query.limit) : 20,
  sortBy: req.query.sortBy as string | undefined,
  sortOrder: req.query.sortOrder === 'DESC' ? 'DESC'  as const: 'ASC' as const,
};
console.log("Query:", req.query);
console.log("Filters:", filters);
      const result = await productService.getAllProducts(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get single product
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      console.log(product)
      res.json({ success: true, data: { product } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get products by supplier
  async getProductsBySupplier(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;
      const products = await productService.getProductsBySupplier(supplierId);
      res.json({ success: true, data: { products } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get supplier products error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Create product
  async createProduct(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const product = await productService.createProduct(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const product = await productService.updateProduct(id, userId, req.body);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Delete product (soft delete)
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permanent } = req.query;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      await productService.deleteProduct(id, userId, permanent === 'true');
      res.json({
        success: true,
        message: permanent === 'true' ? 'Product permanently deleted' : 'Product deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get all categories
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await productService.getCategories();
      res.json({ success: true, data: { categories } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Update stock
  async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await productService.updateStock(id, userId, quantity);
      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update stock error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Toggle product availability
  async toggleAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await productService.toggleAvailability(id, userId);
      res.json({
        success: true,
        message: `Product is now ${result.is_available ? 'available' : 'unavailable'}`,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Toggle availability error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get low stock products
  async getLowStock(req: Request, res: Response) {
    try {
      const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
      const products = await productService.getLowStockProducts(threshold);
      res.json({ success: true, data: { products } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get low stock error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get out of stock products
  async getOutOfStock(req: Request, res: Response) {
    try {
      const products = await productService.getOutOfStockProducts();
      res.json({ success: true, data: { products } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get out of stock error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Upload product images (Cloudinary)
  async uploadImages(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const files = (req.files || []) as Express.Multer.File[];
      const productId = req.body?.product_id as string | undefined;

      if (productId) {
        const product = await productService.getProductById(productId);
        if (product.supplier_id !== userId) {
          const user = req.user;
          if (!user || user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'You can only upload images for your own products' });
            return;
          }
        }
      }

      const images = await productService.uploadProductImages(userId, files, productId);
      res.status(201).json({ success: true, data: { images } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Upload product images error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }
}
