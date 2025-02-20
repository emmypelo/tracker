import { motion } from "framer-motion";

// StatCard component
const StatCard = ({ title, value, icon }) => (
  <motion.div
    className="bg-white p-1 rounded-lg flex flex-col justify-center items-center shadow-md max-w-40"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex flex-col items-center justify-evenly h-20">
      <p className="text-l font-bold text-blue-600">{value}</p>

      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      {/* {icon} */}
    </div>
  </motion.div>
);

export default StatCard;
