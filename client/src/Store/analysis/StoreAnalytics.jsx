import React, { useState, useEffect } from "react";
import { useProduct } from "../../context/ProductContext";

export function StoreAnalytics({ storeId }) {
  const { getStoreAnalytics, loading } = useProduct();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await getStoreAnalytics(storeId);
      if (data) {
        setAnalytics(data);
      }
    };

    if (storeId) {
      fetchAnalytics();
    }
  }, [storeId, getStoreAnalytics]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Store Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Total Orders
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {analytics.totalOrders || 0}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-green-600">
            ₹{analytics.totalRevenue || 0}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            Products Sold
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {analytics.productsSold || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <p className="text-gray-500">
          Analytics details would be displayed here based on your backend
          implementation
        </p>
      </div>
    </div>
  );
}

export default StoreAnalytics;
