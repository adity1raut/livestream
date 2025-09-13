import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import axios from 'axios';
import {
    Search,
    Filter,
    Star,
    Eye,
    ShoppingCart,
    Grid,
    List
} from 'lucide-react';

export default function PublicProducts() {
    const { stores } = useStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const productsPerPage = 12;

    useEffect(() => {
        fetchProducts();
    }, [searchTerm, selectedStore, priceRange, sortBy, currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                store: selectedStore,
                minPrice: priceRange.min,
                maxPrice: priceRange.max,
                sortBy,
                page: currentPage,
                limit: productsPerPage
            };

            // Remove empty params
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            // Fetch all products from all stores
            const allProducts = [];
            if (selectedStore) {
                const res = await axios.get(`/api/stores/${selectedStore}/products`, { params });
                if (res.data.products) {
                    allProducts.push(...res.data.products);
                }
            } else {
                // Fetch from all stores
                const storePromises = stores.map(store =>
                    axios.get(`/api/stores/${store._id}/products`, { params })
                );
                const storeResponses = await Promise.all(storePromises);
                storeResponses.forEach(res => {
                    if (res.data.products) {
                        allProducts.push(...res.data.products);
                    }
                });
            }

            // Apply client-side filtering and sorting
            let filteredProducts = allProducts;

            // Filter by search term
            if (searchTerm) {
                filteredProducts = filteredProducts.filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Filter by price range
            if (priceRange.min) {
                filteredProducts = filteredProducts.filter(product =>
                    product.price >= parseFloat(priceRange.min)
                );
            }
            if (priceRange.max) {
                filteredProducts = filteredProducts.filter(product =>
                    product.price <= parseFloat(priceRange.max)
                );
            }

            // Sort products
            filteredProducts.sort((a, b) => {
                switch (sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'price_low':
                        return a.price - b.price;
                    case 'price_high':
                        return b.price - a.price;
                    case 'rating':
                        const avgRatingA = a.ratings?.length > 0
                            ? a.ratings.reduce((sum, r) => sum + r.rating, 0) / a.ratings.length
                            : 0;
                        const avgRatingB = b.ratings?.length > 0
                            ? b.ratings.reduce((sum, r) => sum + r.rating, 0) / b.ratings.length
                            : 0;
                        return avgRatingB - avgRatingA;
                    default:
                        return 0;
                }
            });

            // Pagination
            const startIndex = (currentPage - 1) * productsPerPage;
            const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
            setProducts(paginatedProducts);
            setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));

        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        return sum / ratings.length;
    };

    const renderStars = (rating, size = 16) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={size}
                className={i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
        ));
    };

    const ProductCard = ({ product }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs">
                    {product.store?.name}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || 'No description available'}
                </p>

                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                        {renderStars(calculateAverageRating(product.ratings))}
                    </div>
                    <span className="text-sm text-gray-500">
                        ({product.ratings?.length || 0})
                    </span>
                </div>

                <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-blue-600">${product.price}</span>
                    <span className={`px-2 py-1 rounded text-sm ${product.stock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.href = `/products/${product._id}`}
                        className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded flex items-center justify-center gap-1 hover:bg-blue-200 transition-colors"
                    >
                        <Eye size={16} />
                        View
                    </button>
                    <button
                        disabled={product.stock === 0}
                        className="flex-1 bg-green-100 text-green-600 px-3 py-2 rounded flex items-center justify-center gap-1 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ShoppingCart size={16} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );

    const ProductListItem = ({ product }) => (
        <div className="bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow">
            <div className="w-24 h-24 flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="text-xl font-bold text-blue-600">${product.price}</span>
                </div>

                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description || 'No description available'}
                </p>

                <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                        {renderStars(calculateAverageRating(product.ratings))}
                        <span className="text-sm text-gray-500">
                            ({product.ratings?.length || 0})
                        </span>
                    </div>

                    <span className="text-sm text-gray-500">
                        Store: {product.store?.name}
                    </span>

                    <span className={`px-2 py-1 rounded text-sm ${product.stock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.href = `/products/${product._id}`}
                        className="bg-blue-100 text-blue-600 px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-200 transition-colors"
                    >
                        <Eye size={16} />
                        View Details
                    </button>
                    <button
                        disabled={product.stock === 0}
                        className="bg-green-100 text-green-600 px-4 py-2 rounded flex items-center gap-1 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ShoppingCart size={16} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Products
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Store
                        </label>
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Stores</option>
                            {stores.map(store => (
                                <option key={store._id} value={store._id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price Range
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="price_low">Price (Low to High)</option>
                            <option value="price_high">Price (High to Low)</option>
                            <option value="rating">Rating (High to Low)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Products Display */}
            {!loading && (
                <>
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-gray-600">
                            Showing {products.length} products
                            {searchTerm && ` for "${searchTerm}"`}
                        </p>
                        <p className="text-gray-600">
                            Page {currentPage} of {totalPages}
                        </p>
                    </div>

                    {products.length > 0 ? (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4 mb-8">
                                    {products.map(product => (
                                        <ProductListItem key={product._id} product={product} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex gap-1">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-2 rounded-lg ${currentPage === page
                                                                ? 'bg-blue-600 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 3 ||
                                                page === currentPage + 3
                                            ) {
                                                return <span key={page} className="px-2 py-2">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Search size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your search criteria or browse all products.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSt
                                    ore('');
                                    setPriceRange({ min: '', max: '' });
                                    setSortBy('name');
                                    setCurrentPage(1);
                                }
                                }
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}