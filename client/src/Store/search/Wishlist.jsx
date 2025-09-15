import React, { useState, useEffect } from "react";
import { useProduct } from "../../context/ProductContext";
import { Heart } from "lucide-react";
import ProductGrid from "./ProductGrid";

export function Wishlist() {
  const { getUserWishlist, wishlist, loading } = useProduct();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchWishlist = async () => {
      const data = await getUserWishlist(currentPage);
      if (data) {
        setTotalPages(data.totalPages);
      }
    };
    fetchWishlist();
  }, [currentPage, getUserWishlist]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">My Wishlist</h2>

      {wishlist?.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Your wishlist is empty</p>
          <p className="text-gray-400">
            Add products to your wishlist to see them here
          </p>
        </div>
      ) : (
        <>
          <ProductGrid products={wishlist} />

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Wishlist;
