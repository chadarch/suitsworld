import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Package, Save, X } from "lucide-react";
import { productAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: () => void;
  onOptimisticAdd?: (product: any) => void;
}

const ProductForm = ({ open, onOpenChange, onProductCreated, onOptimisticAdd }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    status: "active"
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };
      
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate SKU from name
      ...(field === 'name' && !formData.sku && {
        sku: `SW-${value.substring(0, 3).toUpperCase()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      })
    }));
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedImages(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate required fields
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate price and stock are numbers
    if (isNaN(Number(formData.price)) || isNaN(Number(formData.stock))) {
      toast({
        title: "Error",
        description: "Price and stock must be valid numbers",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        toast({
          title: "Request Timeout",
          description: "The request is taking too long. Please try again.",
          variant: "destructive",
          duration: 5000
        });
      }
    }, 30000); // 30 seconds timeout
    
    setIsSubmitting(true);
    
    try {
      // Prepare images array
      let images = [];
      
      // Show initial loading message
      toast({
        title: "Creating Product...",
        description: "Processing your request...",
        duration: 2000
      });

      if (selectedImages.length > 0) {
        // Compress images before upload for better performance
        const compressedImages = await Promise.all(
          selectedImages.map(img => compressImage(img))
        );
        
        const imageFormData = new FormData();
        compressedImages.forEach((image) => {
          imageFormData.append('images', image);
        });

        try {
          console.log('Uploading', compressedImages.length, 'compressed images...');
          
          const uploadResponse = await fetch(`/api/upload/images`, {
            method: 'POST',
            body: imageFormData,
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success && uploadData.data) {
              images = uploadData.data;
              console.log('Images uploaded successfully');
            }
          }
          
          // If upload fails, use placeholder (don't block the process)
          if (images.length === 0) {
            console.log('Image upload failed, using placeholder');
            images = [{
              url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
              alt: "Product image",
              isPrimary: true
            }];
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Use placeholder and continue
          images = [{
            url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
            alt: "Product image",
            isPrimary: true
          }];
        }
      } else {
        // Default placeholder image if no images selected
        images = [{
          url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
          alt: "Product image",
          isPrimary: true
        }];
      }

      // Map form data to API structure
      const productData = {
        name: formData.name,
        description: formData.description || "Premium quality product",
        shortDescription: formData.description?.substring(0, 100) || "Premium product",
        price: parseFloat(formData.price),
        sku: formData.sku,
        category: formData.category === "mens-suits" ? "mens" : 
                 formData.category === "womens-suits" ? "womens" : 
                 formData.category === "childrens-suits" ? "childrens" : "mens",
        subcategory: formData.category === "mens-suits" ? "corporate-suits" :
                    formData.category === "womens-suits" ? "business-suits" :
                    formData.category === "childrens-suits" ? "boys-suits" :
                    formData.category === "accessories" ? "ties-accessories" :
                    formData.category === "shoes" ? "formal-shoes" : "corporate-suits",
        tags: [formData.category, "formal", "premium"],
        images: images,
        inventory: {
          quantity: parseInt(formData.stock),
          trackQuantity: true,
          allowBackorder: false,
          lowStockThreshold: 5
        },
        status: formData.status,
        featured: false
      };

      console.log('Creating product with data:', productData);
      
      // Optimistic update - add product to UI immediately
      if (onOptimisticAdd) {
        const optimisticProduct = {
          ...productData,
          _id: 'temp-' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOptimistic: true
        };
        onOptimisticAdd(optimisticProduct);
        
        // Close dialog immediately for better UX
        onOpenChange(false);
        
        toast({
          title: "Adding Product...",
          description: `"${formData.name}" is being added to your catalog`,
          duration: 3000
        });
      }
      
      const response = await productAPI.create(productData);
      console.log('Product creation response:', response);
      
      // Check if response is successful
      if (response && response.success) {
        // Show final success message
        toast({
          title: "Success! 🎉",
          description: `Product "${formData.name}" has been added to your catalog!`,
          duration: 3000
        });

        // Reset form
        setFormData({
          name: "",
          sku: "",
          category: "",
          price: "",
          stock: "",
          description: "",
          status: "active"
        });
        setSelectedImages([]);
        
        // Refresh the product list to replace optimistic entry with real data
        if (onProductCreated) {
          console.log('Refreshing product list with real data...');
          await onProductCreated();
        }
      } else {
        throw new Error(response?.message || 'Product creation failed');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Create a new product in your catalog
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Executive Navy Business Suit"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="SW-ENS-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mens-suits">Men's Suits</SelectItem>
                <SelectItem value="womens-suits">Women's Suits</SelectItem>
                <SelectItem value="childrens-suits">Children's Suits</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="shoes">Formal Shoes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="599.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="50"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Drag & drop images here</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
                style={{ display: 'none' }}
              />
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">{selectedImages.length} file(s) selected:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="flex items-center bg-gray-100 rounded px-2 py-1 text-xs">
                        <span className="truncate max-w-32">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter detailed product description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating Product..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
