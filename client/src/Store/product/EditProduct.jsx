import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import axios from 'axios';
import { Upload, X, ArrowLeft, Trash2 } from 'lucide-react';

export default function EditProduct({ productId }) {
    const { user, isAuthenticated } = useAuth();
    const { userStore } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [removeImages, setRemoveImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (userStore && productId) {
            fetchProduct();
        }
    }, [userStore, productId]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`/api/stores/products/${productId}`);
            const product = res.data;

            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                stock: product.stock.toString()
            });
            setExistingImages(product.images || []);
        } catch (error) {
            setError('Error fetching product details');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length - removeImages.length + newImages.length + files.length;

        if (totalImages > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setNewImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setNewImagePreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });

        setError('');
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleRemoveExistingImage = (imageUrl) => {
        setRemoveImages(prev => {
            if (prev.includes(imageUrl)) {
                return prev.filter(url => url !== imageUrl);
            } else {
                return [...prev, imageUrl];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('stock', formData.stock);

            // Add images to remove
            if (removeImages.length > 0) {
                formDataToSend.append('removeImages', JSON.stringify(removeImages));
            }

            // Add new images
            newImages.forEach(image => {
                formDataToSend.append('images', image);
            });

            const res = await axios.put(
                `/api/stores/${userStore._id}/products/${productId}`,
                formDataToSend,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            setSuccess('Product updated successfully!');
            setTimeout(() => {
                window.location.href = '/products';
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.error || 'Error updating product');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !userStore) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Required</h1>
                <p className="text-gray-600">You need to have a store to edit products.</p>
            </div>
        );
    }

    if (initialLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => window.location.href = '/products'}
                    className="p-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price ($) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity *
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            required
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Images
                        </label>
                        {existingImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                {existingImages.map((imageUrl, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={imageUrl}
                                            alt={`Current ${index + 1}`}
                                            className={`w-full h-24 object-cover rounded-lg ${removeImages.includes(imageUrl) ? 'opacity-50' : ''
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleRemoveExistingImage(imageUrl)}
                                            className={`absolute -top-2 -right-2 rounded-full p-1 ${removeImages.includes(imageUrl)
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : 'bg-red-500 hover:bg-red-600'
                                                } text-white`}
                                        >
                                            {removeImages.includes(imageUrl) ? (
                                                <span className="text-xs">✓</span>
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mb-4">No current images</p>
                        )}

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add New Images
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleNewImageChange}
                                className="hidden"
                                id="new-image-upload"
                            />
                            <label
                                htmlFor="new-image-upload"
                                className="cursor-pointer flex flex-col items-center justify-center"
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                    Upload new images
                                </span>
                                <span className="mt-1 block text-sm text-gray-600">
                                    PNG, JPG, GIF up to 10MB each
                                </span>
                            </label>
                        </div>

                        {newImagePreviews.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Add:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {newImagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`New ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button

                        type="button"
                        onClick={() => window.location.href = '/products'}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}


