import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchReportCategoriesApi } from "../../../APIrequests/reportCategoryAPI";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Function to generate dynamic colors
const generateColors = (count) => {
  return Array.from(
    { length: count },
    (_, index) => `hsl(${(index * 360) / count}, 70%, 50%)`
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 bg-opacity-90 p-2 rounded shadow-md">
        <p className="text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ReportDistributionChart = () => {
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowLegend(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const {
    data: categoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fetchReportCategories"],
    queryFn: fetchReportCategoriesApi,
    keepPreviousData: true,
  });

  const categories = categoryData?.data.categories || [];

  console.log("Categories Data:", categories);

  // Transform API data to match Recharts format
  const transformedData = categories.map((category) => ({
    title: category.title,
    value: category.reports.length || 0, // Use the length of reports array
  }));

  // Generate dynamic colors based on data length
  const dynamicColors = generateColors(transformedData.length);

  return (
    <motion.div
      className="bg-gray-700 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border-r-gray-700 md:w-1/2 w-full "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium text-gray-100 text-center">
        Reports Distribution
      </h2>
      <div className="h-64">
        {isLoading ? (
          <p className="text-center text-white">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error fetching data</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                nameKey="title"
              >
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={dynamicColors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry, index) => (
                    <span style={{ color: "white" }}>
                      {`${transformedData[index].title}: ${transformedData[index].value}`}
                    </span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default ReportDistributionChart;
