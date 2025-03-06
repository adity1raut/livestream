// components/SuccessToast.js
import { motion, AnimatePresence } from 'framer-motion';

const SuccessToast = ({ cartSuccess }) => {
  return (
    <AnimatePresence>
      {cartSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-4 right-4 bg-emerald-600 text-white py-2 px-4 rounded-md shadow-lg"
        >
          Item added to cart successfully!
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessToast;