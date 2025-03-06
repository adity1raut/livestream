// components/ItemGallery.js
import { motion } from 'framer-motion';

const ItemGallery = ({ items, showItemDetails, loading, error }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {error && <div className="text-red-600 bg-red-100 p-4 rounded-md">{error}</div>}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {items.map((item) => (
          <motion.div
            key={item._id}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:shadow-lg"
            onClick={() => showItemDetails(item)}
          >
            <div className="aspect-w-1 aspect-h-1 relative">
              <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-64 sm:h-48"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white font-medium truncate">{item.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No items found. Please check back later.
        </div>
      )}
    </>
  );
};

export default ItemGallery;