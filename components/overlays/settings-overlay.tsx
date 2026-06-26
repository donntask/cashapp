'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { searchUserByCashtag, updateUserAdminStatus } from '@/lib/firestore-service';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsOverlay({ isOpen, onClose }: SettingsOverlayProps) {
  const { isAdmin, resetAuth } = useAuth();
  const [activeSection, setActiveSection] = useState<'main' | 'security' | 'admin-management'>('main');
  const [searchCashtag, setSearchCashtag] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  if (!isOpen) return null;

  const handleSearchUser = async () => {
    if (!searchCashtag.trim()) return;
    
    setIsSearching(true);
    setMessage('');
    try {
      const user = await searchUserByCashtag(searchCashtag);
      if (user) {
        setFoundUser(user);
        setMessage(`Found: ${user.firstName} ${user.lastName}`);
        setMessageType('success');
      } else {
        setFoundUser(null);
        setMessage('User not found');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error searching user');
      setMessageType('error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!foundUser) return;

    setIsUpdating(true);
    setMessage('');
    try {
      await updateUserAdminStatus(foundUser.uid, true);
      setMessage(`${foundUser.firstName} is now an admin`);
      setMessageType('success');
      setFoundUser(null);
      setSearchCashtag('');
    } catch (error) {
      setMessage('Failed to make admin');
      setMessageType('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    resetAuth();
    localStorage.removeItem('cashapp_auth_data');
    localStorage.removeItem('cashapp_app_data');
    localStorage.removeItem('cashapp_user_id');
    localStorage.removeItem('cashapp_admin');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {activeSection === 'main' ? 'Settings' : activeSection === 'security' ? 'Security' : 'Admin Management'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer bg-none border-0"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Settings */}
          {activeSection === 'main' && (
            <div className="p-6 space-y-4">
              <button
                onClick={() => setActiveSection('security')}
                className="w-full px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer font-semibold text-gray-900"
              >
                Security
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveSection('admin-management')}
                  className="w-full px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer font-semibold text-gray-900"
                >
                  Manage Admins
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left bg-red-100 hover:bg-red-200 rounded-lg cursor-pointer font-semibold text-red-900"
              >
                Logout
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Add New Admin</h3>
                <p className="text-sm text-gray-600 mb-4">Search for a user by cashtag and make them an admin.</p>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search by cashtag"
                    value={searchCashtag}
                    onChange={(e) => setSearchCashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleSearchUser}
                    disabled={isSearching}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg cursor-pointer font-semibold"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>

                  {message && (
                    <div className={`p-3 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                      {message}
                    </div>
                  )}

                  {foundUser && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="font-semibold text-gray-900">{foundUser.firstName} {foundUser.lastName}</p>
                      <p className="text-sm text-gray-600">@{foundUser.cashtag}</p>
                      <button
                        onClick={handleMakeAdmin}
                        disabled={isUpdating}
                        className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg cursor-pointer font-semibold"
                      >
                        {isUpdating ? 'Making Admin...' : 'Make Admin'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Management */}
          {activeSection === 'admin-management' && (
            <div className="p-6 space-y-4">
              <button
                onClick={() => setActiveSection('security')}
                className="w-full px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer font-semibold text-gray-900"
              >
                Add New Admin
              </button>
              <p className="text-sm text-gray-600">Use the Security section to search for users and make them admins.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setActiveSection('main')}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg cursor-pointer font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
