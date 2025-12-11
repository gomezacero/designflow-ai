import React, { useState, useRef } from 'react';
import { User } from '../hooks/useAuth';
import { Camera, Mail, Briefcase, User as UserIcon, Save, X } from 'lucide-react';
import { Button } from './Button';

interface ProfileViewProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when user cancels
  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, avatar: reader.result as string }));
          setIsEditing(true); // Auto-enable edit mode on image change
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar animate-fadeIn">
      
      <header className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-ios-text tracking-tight mb-1">My Profile</h1>
            <p className="text-gray-500">Manage your personal information and account settings.</p>
        </div>
        {isEditing ? (
            <div className="flex gap-3">
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>
                    <Save size={16} /> Save Changes
                </Button>
            </div>
        ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Profile
            </Button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Card */}
        <div className="md:col-span-1">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-4xl font-bold text-gray-300 select-none">
                                {formData.name ? formData.name.charAt(0).toUpperCase() : <UserIcon size={48} />}
                            </div>
                        )}
                    </div>
                    
                    {/* Upload Overlay */}
                    <div 
                        onClick={() => isEditing && fileInputRef.current?.click()}
                        className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white transition-opacity cursor-pointer ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}
                    >
                        <Camera size={24} />
                    </div>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                    />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">{formData.name}</h2>
                <p className="text-sm text-gray-500 font-medium mb-4">{formData.role}</p>

                <div className="w-full pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Status</div>
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold self-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Active
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Details Form */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Personal Info Section */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <UserIcon size={20} className="text-blue-500" />
                    Personal Information
                </h3>
                
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role / Title</label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Mail size={12} /> Email Address
                        </label>
                        <input
                            type="email"
                            disabled={true}
                            value={formData.email}
                            // Email cannot be changed
                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 cursor-not-allowed outline-none select-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase size={12} /> Bio
                        </label>
                        <textarea
                            disabled={!isEditing}
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none h-32 disabled:opacity-70 disabled:cursor-not-allowed"
                            placeholder="Tell us a bit about yourself..."
                        />
                    </div>
                </div>
            </div>

            {/* Account Settings (Placeholder for future) */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-6 md:p-8 opacity-60 pointer-events-none grayscale">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold text-gray-900">Preferences</h3>
                     <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                        <div className="w-10 h-6 bg-blue-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                        <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
