import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useProduct } from "../../context/ProductContext";
import ProductCard from "./ProductCard";

export function ProductGrid({ products }) {
  const { toggleWishlist } = useProduct();
  const { isAuthenticated } = useAuth();

  const handleWishlistToggle = async (productId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to add to wishlist");
      return;
    }

    const result = await toggleWishlist(productId);
    if (result.success) {
      console.log(result.message);
    }
  };

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onWishlistToggle={handleWishlistToggle}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
