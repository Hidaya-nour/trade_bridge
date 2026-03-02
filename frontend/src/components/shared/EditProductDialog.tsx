// src/components/shared/EditProductDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "@/types/product.types";

// Constants (could be moved to a shared constants file later)
const PRODUCT_CATEGORIES = ["Beverages", "Food Products"];
const UNIT_TYPES = [
  "kg",
  "liter",
  "piece",
  "box",
  "carton",
  "dozen",
  "meter",
  "square meter",
  "ton",
  "gram",
  "milliliter",
  "set",
  "pair",
  "bundle",
];

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (productId: string, updatedProduct: Partial<Product>) => void;
  mode: "add" | "edit";
  onAdd?: (product: any) => void; // For add mode
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSave,
  mode,
  onAdd,
}) => {
  if (!product) {
    return null;
  }

  const [formData, setFormData] = useState({
    name: "",
    category: PRODUCT_CATEGORIES[0],
    price: "",
    unit_type: "kg",
    min_order_amount: "",
    stock_quantity: "",
    description: "",
    is_available: true,
  });

  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([]);

  // Reset form when product changes or dialog opens
  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name || "",
        category: product.category || PRODUCT_CATEGORIES[0],
        price: product.price?.toString() || "",
        unit_type: product.unit_type || "kg",
        min_order_amount: product.min_order_amount?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        description: product.description || "",
        is_available: product.is_available ?? true,
      });

      if (product.specifications) {
        const specsArray = Object.entries(product.specifications).map(
          ([key, value]) => ({
            key,
            value,
          }),
        );
        setSpecifications(specsArray);
      } else {
        setSpecifications([]);
      }
    }

    if (mode === "add") {
      setSpecifications([]);
    }
  }, [product, mode, open]);

  const handleSave = () => {
    const specificationsObject: Record<string, string> = {};

    specifications.forEach((spec) => {
      if (spec.key.trim() !== "") {
        specificationsObject[spec.key] = spec.value;
      }
    });

    if (mode === "edit" && product) {
      onSave(product.id, {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        min_order_amount: parseInt(formData.min_order_amount),
        specifications:
          Object.keys(specificationsObject).length > 0
            ? specificationsObject
            : null,
      });
    }

    if (mode === "add" && onAdd) {
      onAdd({
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        min_order_amount: parseInt(formData.min_order_amount),
        specifications:
          Object.keys(specificationsObject).length > 0
            ? specificationsObject
            : null,
      });
    }

    onOpenChange(false);
  };

  const title = mode === "add" ? "Add New Product" : "Edit Product";
  const description =
    mode === "add"
      ? "Fill in the product details to add to your inventory"
      : "Update product information";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4 py-2">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Category and Unit Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_type">Unit Type *</Label>
                <Select
                  value={formData.unit_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETB) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock_quantity: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Minimum Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_order_amount">Minimum Order *</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_order_amount: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* Specifications */}
            <div className="space-y-3">
              <Label>Specifications (Optional)</Label>

              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key (e.g. Weight)"
                    value={spec.key}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[index].key = e.target.value;
                      setSpecifications(updated);
                    }}
                  />
                  <Input
                    placeholder="Value (e.g. 2kg)"
                    value={spec.value}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[index].value = e.target.value;
                      setSpecifications(updated);
                    }}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const updated = specifications.filter(
                        (_, i) => i !== index,
                      );
                      setSpecifications(updated);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() =>
                  setSpecifications([...specifications, { key: "", value: "" }])
                }
              >
                + Add Specification
              </Button>
            </div>
            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_available: checked })
                }
              />
              <Label htmlFor="is_available">
                Active (visible to customers)
              </Label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === "add" ? "Add Product" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
