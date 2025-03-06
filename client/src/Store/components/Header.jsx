
import { motion } from 'framer-motion';

const Header = ({ isAuthenticated, viewMode, setViewMode, showForm, setShowForm, resetForm, setDetailsView, cart }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold text-indigo-700">Beautiful Store</h1>
      
      <div className="flex flex-wrap gap-2">
        {isAuthenticated && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('all')}
              className={`py-2 px-4 rounded-md ${
                viewMode === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-800 border border-gray-300'
              } transition-colors`}
            >
              All Items
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('my-items')}
              className={`py-2 px-4 rounded-md ${
                viewMode === 'my-items' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-800 border border-gray-300'
              } transition-colors`}
            >
              My Items
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowForm((prev) => !prev);
                if (!showForm) resetForm();
                setDetailsView(null);
              }}
              className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              {showForm ? 'Close Form' : 'Add New Item'}
            </motion.button>
          </>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors relative"
        >
          Cart ({cart.length})
        </motion.button>
      </div>
    </div>
  );
};

export default Header;