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
}

const ProductForm = ({ open, onOpenChange, onProductCreated }: ProductFormProps) => {
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
    
    try {
      // Prepare images array
      let images = [];
      
      // Show initial loading message
      toast({
        title: "Creating Product...",
        description: "Please wait while we process your request",
        duration: 3000
      });

      if (selectedImages.length > 0) {
        // Upload images to server
        const imageFormData = new FormData();
        selectedImages.forEach((image) => {
          imageFormData.append('images', image);
        });

        try {
          console.log('Uploading images...', selectedImages.length, 'files');
          
          // Convert images to base64 for immediate display and fallback
          const imagePromises = selectedImages.map(async (file, index) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  url: e.target?.result as string,
                  alt: file.name,
                  isPrimary: index === 0,
                  filename: `${Date.now()}-${file.name}`
                });
              };
              reader.readAsDataURL(file);
            });
          });
          
          const base64Images = await Promise.all(imagePromises);
          
          // Try to upload to server, but don't block on failure
          const uploadResponse = await fetch(`/api/upload/images`, {
            method: 'POST',
            body: imageFormData,
          });
          
          console.log('Upload response status:', uploadResponse.status);
          const uploadData = await uploadResponse.json();
          console.log('Upload response data:', uploadData);
          
          if (uploadResponse.ok && uploadData.success) {
            images = uploadData.data || [];
            console.log('Successfully uploaded images:', images);
          } else {
            // If server upload fails, try base64 upload as fallback
            console.log('Server upload failed, trying base64 fallback');
            try {
              const base64Response = await fetch('/api/upload/base64', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ images: base64Images }),
              });
              
              const base64Data = await base64Response.json();
              if (base64Response.ok && base64Data.success) {
                images = base64Data.data || base64Images;
                console.log('Base64 upload successful');
              } else {
                images = base64Images;
                console.log('Base64 upload failed, using local images');
              }
            } catch (base64Error) {
              console.error('Base64 upload error:', base64Error);
              images = base64Images;
            }
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          
          // Try to convert images to base64 as fallback
          try {
            const imagePromises = selectedImages.map(async (file, index) => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  resolve({
                    url: e.target?.result as string,
                    alt: file.name,
                    isPrimary: index === 0,
                    filename: `${Date.now()}-${file.name}`
                  });
                };
                reader.readAsDataURL(file);
              });
            });
            
            images = await Promise.all(imagePromises);
            
            toast({
              title: "Using Local Images",
              description: `Server upload failed. Using local images for now.`,
              variant: "default",
              duration: 3000
            });
          } catch (base64Error) {
            console.error('Base64 conversion failed:', base64Error);
            
            // Final fallback to placeholder
            images = [{
              url: "/lovable-uploads/4ba80d39-2697-438c-9ed7-86f8311f2935.png",
              alt: "Product image placeholder",
              isPrimary: true
            }];
            
            toast({
              title: "Image Upload Warning ⚠️",
              description: `Upload failed. Using placeholder image instead.`,
              variant: "destructive",
              duration: 4000
            });
          }
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
      const response = await productAPI.create(productData);
      console.log('Product creation response:', response);
      
      // Check if response is successful
      if (response && response.success) {
        // Show success message
        toast({
          title: "Success! 🎉",
          description: `Product "${formData.name}" has been created successfully!`,
          duration: 5000
        });

        // Reset form and close dialog
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
        
        // Call the callback to refresh the product list BEFORE closing dialog
        if (onProductCreated) {
          console.log('Refreshing product list...');
          await onProductCreated();
        }
        
        // Close dialog after refresh
        onOpenChange(false);
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
