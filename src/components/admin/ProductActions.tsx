'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteProduct } from '@/lib/server-actions/admin';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface ProductActionsProps {
  productId: string;
  productSlug: string;
}

export default function ProductActions({ productId, productSlug }: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);
      if (result.ok) {
        router.refresh();
      } else {
        alert(`Error deleting product: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while deleting the product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    // For now, redirect to the new product page with a note that this is for editing
    // In a real implementation, you'd want to create the edit route
    router.push(`/admin/products/new?edit=${productId}`);
  };

  const handleView = () => {
    router.push(`/products/${productSlug}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleView}
        className="h-8 px-2"
        title="View Product"
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only">View</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className="h-8 px-2"
        title="Edit Product"
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 px-2"
        title="Delete Product"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}
