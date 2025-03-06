// components/ItemForm.js
import { motion } from 'framer-motion';

const ItemForm = ({
  showForm,
  formData,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  selectedFile,
  preview,
  selectedItem,
  formError,
  formSuccess,
  resetForm,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        {selectedItem ? 'Edit Item' : 'Add New Item'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form inputs */}
        <input
          name="title"
          type="text"
          value={formData.title}
          onChange={handleInputChange}
          required
          placeholder="Title"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleInputChange}
          required
          placeholder="Price"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <input
          name="rating"
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={formData.rating}
          onChange={handleInputChange}
          required
          placeholder="Rating"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          rows="4"
        />
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {preview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img
                src={preview}
                alt="Preview"
                className="max-w-xs rounded-md border"
              />
            </div>
          )}
          {selectedItem && !preview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="max-w-xs rounded-md border"
              />
            </div>
          )}
        </div>

        {formError && <div className="text-red-600">{formError}</div>}
        {formSuccess && (
          <div className="text-green-600">
            Item {selectedItem ? 'updated' : 'added'} successfully!
          </div>
        )}

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {selectedItem ? 'Update' : 'Submit'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={resetForm}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ItemForm;