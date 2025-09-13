import React, { useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import ProductGrid from './ProductGrid';

export function ProductSearch() {
  const { searchProducts, products, searchLoading } = useProduct();
  const [searchParams, setSearchParams] = useState({
    q: '',
    minPrice: '',
    maxPrice: '',
    category: '',
    store: '',
    sort: 'createdAt',
    order: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const params = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
    await searchProducts(params);
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchParams.q}
              onChange={(e) => handleInputChange('q', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          <button
            type="submit"
            disabled={searchLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                value={searchParams.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="₹0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                value={searchParams.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="₹10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={searchParams.sort}
                onChange={(e) => handleInputChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="createdAt">Date Created</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={searchParams.order}
                onChange={(e) => handleInputChange('order', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}
      </form>

      <ProductGrid products={products} />
    </div>
  );
}

export default ProductSearch;