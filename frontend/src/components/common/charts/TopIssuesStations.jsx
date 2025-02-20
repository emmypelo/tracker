"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { station: "Station A", reports: 100 },
  { station: "Station B", reports: 90 },
  { station: "Station C", reports: 80 },
  { station: "Station D", reports: 70 },
  { station: "Station E", reports: 60 },
  { station: "Station F", reports: 50 },
  { station: "Station G", reports: 40 },
  { station: "Station H", reports: 30 },
  { station: "Station I", reports: 20 },
  { station: "Station J", reports: 10 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-4 shadow-xl rounded-lg border border-gray-300"
      >
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-gray-600">
          Reports: {payload[0].value.toLocaleString()}
        </p>
      </motion.div>
    );
  }
  return null;
};

export default function StationChart() {
  return (
    <div className="w-full bg-white rounded-lg shadow-xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Station Reports Statistics
        </h3>
        <p className="text-sm text-gray-600">
          A visual representation of reports per station
        </p>
      </div>
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="station"
              tick={{ fill: "#374151", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              angle={-90}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: "#374151" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar
              dataKey="reports"
              fill="url(#colorGradient)"
              radius={[6, 6, 0, 0]}
              barSize={45}
              animationDuration={800}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
