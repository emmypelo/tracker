import { motion } from "framer-motion";

const StatCard = ({ title, value }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center h-28 md:h-16 p-3" 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="mt-2 text-xl font-bold text-indigo-600">{value}</p>
      <h3 className="text-l font-semibold text-gray-700">{title}</h3>
    </motion.div>
  );
};

export default StatCard;
