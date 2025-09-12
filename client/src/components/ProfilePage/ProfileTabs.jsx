import React from 'react';
import { Grid, Users } from 'lucide-react';

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileData.posts && profileData.posts.length > 0 ? (
                profileData.posts.map((post, i) => (
                  <div key={post._id || i} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"></div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  <Grid className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'followers' && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{(profileData.followers?.length || 0) > 0 ? 'Followers list coming soon' : 'No followers yet'}</p>
            </div>
          )}
          {activeTab === 'following' && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{(profileData.following?.length || 0) > 0 ? 'Following list coming soon' : 'Not following anyone yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;