import mongoose from "mongoose";
import Product from "../../models/Product.models.js";

export async function getStoreAnalytics(req, res) {
  try {
    const { storeId } = req.params;

    // Get products count
    const totalProducts = await Product.countDocuments({ store: storeId });

    // Get products with stock
    const inStockProducts = await Product.countDocuments({
      store: storeId,
      stock: { $gt: 0 },
    });

    // Get out of stock products
    const outOfStockProducts = totalProducts - inStockProducts;

    // Get average rating across all products
    const ratingAggregation = await Product.aggregate([
      { $match: { store: mongoose.Types.ObjectId(storeId) } },
      { $unwind: "$ratings" },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$ratings.rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      ratingAggregation.length > 0 ? ratingAggregation[0].averageRating : 0;
    const totalRatings =
      ratingAggregation.length > 0 ? ratingAggregation[0].totalRatings : 0;

    // Get top rated products
    const topRatedProducts = await Product.aggregate([
      { $match: { store: mongoose.Types.ObjectId(storeId) } },
      {
        $addFields: {
          averageRating: { $avg: "$ratings.rating" },
          ratingCount: { $size: "$ratings" },
        },
      },
      { $sort: { averageRating: -1, ratingCount: -1 } },
      { $limit: 5 },
    ]);

    // Get recent ratings
    const recentRatings = await Product.aggregate([
      { $match: { store: mongoose.Types.ObjectId(storeId) } },
      { $unwind: "$ratings" },
      { $sort: { "ratings.createdAt": -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "ratings.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          productName: "$name",
          rating: "$ratings.rating",
          review: "$ratings.review",
          createdAt: "$ratings.createdAt",
          userName: { $arrayElemAt: ["$user.username", 0] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalRatings,
        topRatedProducts,
        recentRatings,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
