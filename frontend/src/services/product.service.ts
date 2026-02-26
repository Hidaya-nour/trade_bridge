import type { CreateProductData, ProductFilters, ProductResponse, ProductsResponse, UpdateProductData } from '@/types/product.types';
import api from './api';

class ProductService {
  // Get all products with filters
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.supplier_id) params.append('supplierId', filters.supplier_id);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.is_available !== undefined) params.append('isAvailable', String(filters.is_available));
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  }

  // Get single product by ID
  async getProductById(id: string): Promise<ProductResponse> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  // Get products by supplier
  async getProductsBySupplier(supplierId: string): Promise<ProductsResponse> {
    
    const response = await api.get(`/products/supplier/${supplierId}`);
    return response.data;
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/products/categories');
    return response.data.data.categories;
  }

  // Create new product (for distributors/factories)
  async createProduct(data: CreateProductData): Promise<ProductResponse> {
    const response = await api.post('/products', data);
    return response.data;
  }

  // Update product
  async updateProduct(id: string, data: UpdateProductData): Promise<ProductResponse> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  }

  // Delete product (soft delete)
  async deleteProduct(id: string, permanent?: boolean): Promise<any> {
    const response = await api.delete(`/products/${id}${permanent ? '?permanent=true' : ''}`);
    return response.data;
  }

  // Update stock
  async updateStock(id: string, quantity: number): Promise<any> {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  }

  // Toggle availability
  async toggleAvailability(id: string): Promise<any> {
    const response = await api.patch(`/products/${id}/toggle-availability`);
    return response.data;
  }

  // Get low stock products
  async getLowStock(threshold?: number): Promise<ProductsResponse> {
    const response = await api.get(`/products/low-stock${threshold ? `?threshold=${threshold}` : ''}`);
    return response.data;
  }

  // Get out of stock products
  async getOutOfStock(): Promise<ProductsResponse> {
    const response = await api.get('/products/out-of-stock');
    return response.data;
  }
}

export default new ProductService();