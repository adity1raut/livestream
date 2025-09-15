import React from "react";
import { Store, Edit, Trash2, Package, Calendar } from "lucide-react";

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
      className={`bg-gray-800/60 rounded-2xl border border-gray-700/50 overflow-hidden ${
        onClick
          ? "cursor-pointer hover:shadow-2xl hover:border-purple-500/50 hover:bg-gray-700/60"
          : ""
      } transition-all duration-300 shadow-xl backdrop-blur-sm group flex flex-col h-80`}
      onClick={handleCardClick}
    >
      {/* Header with Logo and Basic Info */}
      <div className="flex items-center p-4 bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-b border-gray-700/50">
        {store.logo ? (
          <img
            src={store.logo}
            alt={store.name}
            className="w-12 h-12 rounded-lg object-cover border-2 border-purple-400/50 shadow-lg transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-700/80 rounded-lg flex items-center justify-center border-2 border-purple-400/50 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Store className="h-6 w-6 text-purple-400" />
          </div>
        )}

        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
            {store.name}
          </h3>
          {store.owner && (
            <p className="text-sm text-gray-400 truncate">
              by {store.owner.profile?.name || store.owner.username}
            </p>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="flex-1 p-4">
        {store.description ? (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
            {store.description}
          </p>
        ) : (
          <p className="text-gray-500 text-sm italic mb-4">
            No description available
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/30">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-gray-400">Products</span>
            </div>
            <div className="text-lg font-semibold text-white mt-1">
              {store.products?.length || 0}
            </div>
          </div>

          <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/30">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-gray-400">Since</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              {new Date(store.createdAt).getFullYear()}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      {showActions ? (
        <div className="p-4 bg-gray-800/40 border-t border-gray-700/50">
          <div className="flex space-x-2">
            <button
              onClick={handleEditClick}
              className="flex-1 px-3 py-2 text-sm bg-purple-900/40 text-purple-400 rounded-lg hover:bg-purple-800/50 transition-all duration-300 flex items-center justify-center space-x-2 border border-purple-700/50 transform hover:scale-105"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 px-3 py-2 text-sm bg-red-900/40 text-red-400 rounded-lg hover:bg-red-800/50 transition-all duration-300 flex items-center justify-center space-x-2 border border-red-700/50 transform hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-800/40 border-t border-gray-700/50">
          <div className="text-center">
            <span className="text-xs text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
              Click to explore store
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreCard;
