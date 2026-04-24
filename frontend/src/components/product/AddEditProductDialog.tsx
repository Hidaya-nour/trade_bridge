// src/components/shared/EditProductDialog.tsx
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
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
import productService from "@/services/product.service";

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
  onSave?: (productId: string, updatedProduct: Partial<Product>) => void;
  mode: "add" | "edit";
  onAdd?: (product: any) => void; // For add mode
  categories?: string[];
  unitTypes?: string[];
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSave,
  mode,
  onAdd,
  categories = PRODUCT_CATEGORIES,
  unitTypes = UNIT_TYPES,
}) => {
  const initialFormData = {
    name: "",
    category: categories[0] || PRODUCT_CATEGORIES[0],
    price: "",
    unit_type: unitTypes[0] || "kg",
    min_order_amount: "",
    stock_quantity: "",
    description: "",
    pickup_location: "",
    is_available: true,
    delivery_available: true,
    delivery_pricing: "free" as "free" | "paid",
    delivery_fee_per_km: "",
    free_delivery_max_distance_km: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([]);

  // Reset form when product changes or dialog opens
  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        name: product.name || "",
        category: product.category || categories[0] || PRODUCT_CATEGORIES[0],
        price: product.price?.toString() || "",
        unit_type: product.unit_type || unitTypes[0] || "kg",
        min_order_amount: product.min_order_amount?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        description: product.description || "",
        pickup_location: (product as any).pickup_location || "",
        is_available: product.is_available ?? true,
        delivery_available: product.delivery_available ?? true,
        delivery_pricing: product.delivery_pricing || "free",
        delivery_fee_per_km:
          product.delivery_fee_per_km !== null &&
          product.delivery_fee_per_km !== undefined
            ? String(product.delivery_fee_per_km)
            : "",
        free_delivery_max_distance_km:
          product.free_delivery_max_distance_km !== null &&
          product.free_delivery_max_distance_km !== undefined
            ? String(product.free_delivery_max_distance_km)
            : "",
      });

      if (product.specifications) {
        let parsedSpecs = product.specifications;

        // If it's a string, parse it
        if (typeof product.specifications === "string") {
          try {
            parsedSpecs = JSON.parse(product.specifications);
          } catch (error) {
            console.error("Invalid specifications JSON");
            parsedSpecs = {};
          }
        }

        const specsArray = Object.entries(
          parsedSpecs as Record<string, string>,
        ).map(([key, value]) => ({
          key,
          value,
        }));

        setSpecifications(specsArray);
      } else {
        setSpecifications([]);
      }

      setExistingImages(Array.isArray(product.images) ? product.images : []);
    }

    if (mode === "add" && open) {
      setFormData({
        ...initialFormData,
        category: categories[0] || PRODUCT_CATEGORIES[0],
        unit_type: unitTypes[0] || "kg",
      });
      setSpecifications([]);
      setExistingImages([]);
    }
  }, [product, mode, open, categories, unitTypes]);

  useEffect(() => {
    if (!open && (imagePreviews.length > 0 || imageFiles.length > 0)) {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setImageFiles([]);
      setIsUploadingImages(false);
    }
  }, [open, imagePreviews.length, imageFiles.length]);

  const canAddMoreImages = useMemo(() => {
    return existingImages.length + imageFiles.length < 6;
  }, [existingImages.length, imageFiles.length]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 6 - (existingImages.length + imageFiles.length);
    const filesToAdd = files.slice(0, Math.max(0, remainingSlots));

    if (filesToAdd.length < files.length) {
      toast.error("You can upload up to 6 images.");
    }

    const previews = filesToAdd.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...filesToAdd]);
    setImagePreviews((prev) => [...prev, ...previews]);

    event.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return next;
    });
  };

  const handleSave = async () => {
    if (
      formData.delivery_available &&
      formData.delivery_pricing === "paid" &&
      (formData.delivery_fee_per_km === "" ||
        Number(formData.delivery_fee_per_km) <= 0)
    ) {
      toast.error("Set delivery fee per KM greater than 0 for paid delivery.");
      return;
    }

    if (
      formData.free_delivery_max_distance_km !== "" &&
      Number(formData.free_delivery_max_distance_km) < 0
    ) {
      toast.error("Max free delivery distance cannot be negative.");
      return;
    }

    const specificationsObject: Record<string, string> = {};

    specifications.forEach((spec) => {
      if (spec.key.trim() !== "") {
        specificationsObject[spec.key] = spec.value;
      }
    });

    try {
      let uploadedImages: string[] = [];

      if (imageFiles.length > 0) {
        setIsUploadingImages(true);
        uploadedImages = await productService.uploadProductImages(
          imageFiles,
          mode === "edit" && product ? product.id : undefined,
        );
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        min_order_amount: parseInt(formData.min_order_amount),
        delivery_fee_per_km:
          formData.delivery_available && formData.delivery_pricing === "paid"
            ? parseFloat(formData.delivery_fee_per_km || "0")
            : 0,
        free_delivery_max_distance_km:
          formData.delivery_available &&
          formData.free_delivery_max_distance_km !== ""
            ? parseFloat(formData.free_delivery_max_distance_km)
            : null,
        specifications:
          Object.keys(specificationsObject).length > 0
            ? specificationsObject
            : null,
        images: [...existingImages, ...uploadedImages],
      };

      if (mode === "edit" && product && onSave) {
        await onSave(product.id, payload);
      }

      if (mode === "add" && onAdd) {
        await onAdd(payload);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save product", error);
      toast.error("Failed to upload or save product images.");
    } finally {
      setIsUploadingImages(false);
    }
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
                    {categories.map((category) => (
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
                    {unitTypes.map((unit) => (
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

            {/* Pickup Location */}
            <div className="space-y-2">
              <Label htmlFor="pickup_location">Pickup Location</Label>
              <Textarea
                id="pickup_location"
                placeholder="Optional. Leave empty to use your account address."
                rows={2}
                value={(formData as any).pickup_location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pickup_location: e.target.value,
                  } as any)
                }
              />
              <p className="text-xs text-muted-foreground">
                Buyers will see this as the pickup point for drivers.
              </p>
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

            {/* Product Images */}
            <div className="space-y-2">
              <Label>Product Images (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={!canAddMoreImages}
              />
              <p className="text-xs text-muted-foreground">
                Upload up to 6 images. JPG, PNG, or WEBP. Max 10MB each.
              </p>

              {(existingImages.length > 0 || imagePreviews.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingImages.map((url, index) => (
                    <div
                      key={`existing-${url}-${index}`}
                      className="relative group"
                    >
                      <img
                        src={url}
                        alt="Product"
                        className="h-24 w-full rounded-md border object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 bg-white/80 hover:bg-white"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {imagePreviews.map((url, index) => (
                    <div
                      key={`new-${url}-${index}`}
                      className="relative group"
                    >
                      <img
                        src={url}
                        alt="New product"
                        className="h-24 w-full rounded-md border object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 bg-white/80 hover:bg-white"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Delivery Settings */}
            <div className="space-y-3 border rounded-md p-3">
              <h4 className="text-sm font-semibold">Delivery Policy</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  id="delivery_available"
                  checked={formData.delivery_available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, delivery_available: checked })
                  }
                />
                <Label htmlFor="delivery_available">
                  Supplier provides delivery for this product
                </Label>
              </div>

              {formData.delivery_available && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_pricing">Delivery Pricing</Label>
                    <Select
                      value={formData.delivery_pricing}
                      onValueChange={(value: "free" | "paid") =>
                        setFormData({ ...formData, delivery_pricing: value })
                      }
                    >
                      <SelectTrigger id="delivery_pricing">
                        <SelectValue placeholder="Select delivery pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free delivery</SelectItem>
                        <SelectItem value="paid">Paid per KM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.delivery_pricing === "paid" && (
                    <div className="space-y-2">
                      <Label htmlFor="delivery_fee_per_km">
                        Delivery Fee Per KM (ETB)
                      </Label>
                      <Input
                        id="delivery_fee_per_km"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.delivery_fee_per_km}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delivery_fee_per_km: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="free_delivery_max_distance_km">
                      Max Distance For Free Delivery (KM) (Optional)
                    </Label>
                    <Input
                      id="free_delivery_max_distance_km"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Leave empty for no free distance"
                      value={formData.free_delivery_max_distance_km}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          free_delivery_max_distance_km: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      If buyer is within this distance, delivery becomes free.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUploadingImages}>
            {mode === "add" ? "Add Product" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
