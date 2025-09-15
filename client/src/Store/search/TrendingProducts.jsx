import React, { useState, useEffect } from "react";
import { useProduct } from "../../context/ProductContext";
import ProductGrid from "./ProductGrid";

export function TrendingProducts() {
  const { getTrendingProducts, loading } = useProduct();
  const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const products = await getTrendingProducts(12);
      if (products) {
        setTrendingProducts(products);
      }
    };
    fetchTrending();
  }, [getTrendingProducts]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading trending products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Trending Products</h2>
      <ProductGrid products={trendingProducts} />
    </div>
  );
}

export default TrendingProducts;
