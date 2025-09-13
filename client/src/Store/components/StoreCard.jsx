import React from 'react';
import { Store, Package, Calendar, Eye, Edit, Trash2 } from 'lucide-react';

function StoreCard({ store, onClick, showActions = false, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
              <p className="text-sm text-gray-500">by {store.owner?.profile?.name || store.owner?.username}</p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(store)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(store)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Package className="h-4 w-4" />
            <span>{store.products?.length || 0} products</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(store.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button
          onClick={() => onClick(store)}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>View Store</span>
        </button>
      </div>
    </div>
  );
}

export default StoreCard;