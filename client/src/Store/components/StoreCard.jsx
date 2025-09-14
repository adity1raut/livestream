import React from 'react';
import { Store, Edit, Trash2, Package, Calendar } from 'lucide-react';

function StoreCard({ store, showActions = false, onEdit, onDelete, onClick }) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(store);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(store);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(store);
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-blue-300' : ''
      } transition-all duration-200`}
      onClick={handleCardClick}
    >
      {/* Store Logo/Header */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
        {store.logo ? (
          <img
            src={store.logo}
            alt={store.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-white"
          />
        ) : (
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <Store className="h-8 w-8 text-blue-600" />
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {store.name}
        </h3>
        
        {store.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {store.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Package className="h-4 w-4" />
            <span>{store.products?.length || 0} products</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(store.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {store.owner && (
          <div className="text-sm text-gray-600 mb-3">
            by {store.owner.profile?.name || store.owner.username}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2 border-t border-gray-100">
            <button
              onClick={handleEditClick}
              className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreCard;