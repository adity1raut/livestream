import React, { useState, useEffect } from 'react';
import Post from './PostCard';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const MyPosts = () => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated || authLoading) return;
        async function fetchMyPosts() {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get('/api/auth/profile/me/posts', { withCredentials: true });
                if (res.data.success) {
                    setPosts(res.data.data);
                } else {
                    setError(res.data.message || 'Failed to fetch your posts');
                }
            } catch (err) {
                setError('Failed to fetch your posts');
            } finally {
                setLoading(false);
            }
        }
        fetchMyPosts();
    }, [isAuthenticated, authLoading]);

    if (authLoading || loading) return <div className="text-center py-12">Loading your posts...</div>;
    if (!isAuthenticated) return <div className="text-center py-12 text-red-500">You must be logged in to view your posts.</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
    if (!posts.length) return <div className="text-center py-12">You have not posted anything yet.</div>;

    return (
        <div className="max-w-2xl mx-auto pt-40 p-4">
            <h2 className="text-2xl pt-40 font-bold mb-6">My Posts</h2>
            <div className="space-y-4">
                {posts.map(post => (
                    <Post key={post._id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default MyPosts;
