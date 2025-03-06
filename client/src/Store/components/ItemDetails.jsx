
import { motion } from 'framer-motion';

const ItemDetails = ({ detailsView, setDetailsView, handleAddToCart, isAuthenticated, isItemOwner, handleEdit, handleDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden"
    >
      <div className="md:flex">
        <div className="md:w-1/2">
          <img
            src={detailsView.image}
            alt={detailsView.title}
            className="w-full h-96 object-cover"
          />
        </div>
        <div className="p-6 md:w-1/2">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">{detailsView.title}</h2>
            <button 
              onClick={() => setDetailsView(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="text-yellow-500 mr-2">
              {'★'.repeat(Math.round(detailsView.rating))}
              {'☆'.repeat(5 - Math.round(detailsView.rating))}
            </div>
            <span className="text-gray-600">({detailsView.rating})</span>
          </div>
          
          <p className="text-3xl font-bold text-indigo-600 mb-4">${detailsView.price}</p>
          
          <p className="text-gray-700 mb-6">{detailsView.description}</p>
          
          <p className="text-sm text-gray-500 mb-6">
            Posted by: {detailsView.owner}
          </p>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddToCart(detailsView)}
              className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Add to Cart
            </motion.button>
            
            {isAuthenticated && isItemOwner(detailsView) && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(detailsView)}
                  className="bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(detailsView._id)}
                  className="bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemDetails;