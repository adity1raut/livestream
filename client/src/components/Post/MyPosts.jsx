import React, { useState, useEffect } from "react";
import Post from "./PostCard";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const MyPosts = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    async function fetchMyPosts() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/auth/profile/me/posts", {
          withCredentials: true,
        });
        if (res.data.success) {
          setPosts(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch your posts");
        }
      } catch (err) {
        setError("Failed to fetch your posts");
      } finally {
        setLoading(false);
      }
    }
    fetchMyPosts();
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading)
    return (
      <div className="text-center py-12 text-purple-400 bg-gradient-to-br from-[#18181b] to-[#232136] rounded-xl shadow-lg">
        Loading your posts...
      </div>
    );
  if (!isAuthenticated)
    return (
      <div className="text-center py-12 text-red-400 bg-gradient-to-br from-[#18181b] to-[#232136] rounded-xl shadow-lg">
        You must be logged in to view your posts.
      </div>
    );
  if (error)
    return (
      <div className="text-center py-12 text-red-400 bg-gradient-to-br from-[#18181b] to-[#232136] rounded-xl shadow-lg">
        {error}
      </div>
    );
  if (!posts.length)
    return (
      <div className="text-center py-12 text-gray-400 bg-gradient-to-br from-[#18181b] to-[#232136] rounded-xl shadow-lg">
        You have not posted anything yet.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto pt-40 p-4 bg-gradient-to-br from-[#18181b] to-[#232136] min-h-screen rounded-2xl shadow-2xl border border-[#2a2139]">
      <h2 className="text-2xl font-bold mb-6 text-purple-200 drop-shadow">
        My Posts
      </h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default MyPosts;
