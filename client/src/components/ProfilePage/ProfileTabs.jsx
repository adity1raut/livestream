function UserPostsList({ username }) {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/auth/profile/${username}/posts`, { withCredentials: true });
        if (res.data.success) {
          setPosts(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch posts");
        }
      } catch (err) {
        setError("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [username]);

  if (loading) return (
    <div className="col-span-3 text-center py-12 text-gray-500">
      <Grid className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>Loading posts...</p>
    </div>
  );
  if (error) return (
    <div className="col-span-3 text-center py-12 text-red-500">
      <Grid className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>{error}</p>
    </div>
  );
  if (!posts.length) return (
    <div className="col-span-3 text-center py-12 text-gray-500">
      <Grid className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>No posts yet</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div key={post._id} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between p-4">
          <div className="mb-2 text-gray-800 font-semibold">{post.content}</div>
          {post.media?.url && post.media.type === 'image' && (
            <img src={post.media.url} alt="post" className="w-full h-32 object-cover rounded" />
          )}
          {post.media?.url && post.media.type === 'video' && (
            <video src={post.media.url} controls className="w-full h-32 object-cover rounded" />
          )}
          <div className="text-xs text-gray-500 mt-2">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
function FollowingList({ username }) {
  const [following, setFollowing] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchFollowing() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/auth/profile/${username}/following`, { withCredentials: true });
        if (res.data.success) {
          setFollowing(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch following");
        }
      } catch (err) {
        setError("Failed to fetch following");
      } finally {
        setLoading(false);
      }
    }
    fetchFollowing();
  }, [username]);

  if (loading) return (
    <div className="text-center py-12 text-gray-500">
      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>Loading following...</p>
    </div>
  );
  if (error) return (
    <div className="text-center py-12 text-red-500">
      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>{error}</p>
    </div>
  );
  if (!following.length) return (
    <div className="text-center py-12 text-gray-500">
      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>Not following anyone yet</p>
    </div>
  );
  return (
    <div className="py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {following.map(f => (
        <div
          key={f._id}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 flex items-center gap-4 shadow cursor-pointer hover:bg-purple-100"
          onClick={() => navigate(`/profile/${f.username}`)}
        >
          <img src={f.profile?.profileImage || '/default-avatar.png'} alt={f.username} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
          <div>
            <div className="font-semibold text-gray-800">{f.profile?.name || f.username}</div>
            <div className="text-gray-500 text-sm">@{f.username}</div>
            <div className="text-gray-500 text-xs">{f.profile?.bio}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
import React from 'react';
import axios from 'axios';
import { Grid, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FollowersList({ username }) {
  const [followers, setFollowers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchFollowers() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/auth/profile/${username}/followers`, { withCredentials: true });
        if (res.data.success) {
          setFollowers(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch followers");
        }
      } catch (err) {
        setError("Failed to fetch followers");
      } finally {
        setLoading(false);
      }
    }
    fetchFollowers();
  }, [username]);

  if (loading) return (
    <div className="text-center py-12 text-gray-500">
      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>Loading followers...</p>
    </div>
  );
  if (error) return (
    <div className="text-center py-12 text-red-500">
      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>{error}</p>
    </div>
  );
  if (!followers.length) return (
    <div className="text-center py-12 text-gray-500">
      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>No followers yet</p>
    </div>
  );
  return (
    <div className="py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {followers.map(f => (
        <div
          key={f._id}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 flex items-center gap-4 shadow cursor-pointer hover:bg-purple-100"
          onClick={() => navigate(`/profile/${f.username}`)}
        >
          <img src={f.profile?.profileImage || '/default-avatar.png'} alt={f.username} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200" />
          <div>
            <div className="font-semibold text-gray-800">{f.profile?.name || f.username}</div>
            <div className="text-gray-500 text-sm">@{f.username}</div>
            <div className="text-gray-500 text-xs">{f.profile?.bio}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ProfileTabs = ({ profileData, activeTab, setActiveTab }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['posts', 'followers', 'following'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all relative ${activeTab === tab
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className="capitalize">{tab}</span>
                <span className="ml-2 text-sm">
                  ({tab === 'posts' ? profileData.posts?.length || 0 :
                    tab === 'followers' ? profileData.followers?.length || 0 :
                      profileData.following?.length || 0})
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'posts' && (
            <UserPostsList username={profileData.username} />
          )}
          {activeTab === 'followers' && (
            <FollowersList username={profileData.username} />
          )}
          {activeTab === 'following' && (
            <FollowingList username={profileData.username} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;