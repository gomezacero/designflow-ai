import React, { useState, useRef } from 'react';
import { User } from '../hooks/useAuth';
import { Camera, Mail, Briefcase, User as UserIcon, Save, Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../hooks/useTheme';

interface ProfileViewProps {
    user: User;
    onUpdateProfile: (updates: Partial<User>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
    const { theme, toggleTheme } = useTheme();
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
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-1">My Profile</h1>
                    <p className="text-text-secondary">Manage your personal information and account settings.</p>
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

                <div className="md:col-span-1">
                    <div className="bg-bg-surface rounded-[24px] shadow-sm border border-border-default p-6 flex flex-col items-center text-center transition-colors">
                        <div className="relative group mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-bg-surface shadow-lg bg-bg-canvas flex items-center justify-center">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-4xl font-bold text-gray-300 dark:text-gray-600 select-none">
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

                        <h2 className="text-xl font-bold text-text-primary mb-1">{formData.name}</h2>
                        <p className="text-sm text-text-secondary font-medium mb-4">{formData.role}</p>

                        <div className="w-full pt-4 border-t border-border-default flex flex-col gap-2">
                            <div className="text-xs text-text-secondary uppercase font-bold tracking-wider opacity-60">Status</div>
                            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold self-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Active
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Form */}
                <div className="md:col-span-2 space-y-6">

                    {/* Personal Info Section */}
                    <div className="bg-bg-surface rounded-[24px] shadow-sm border border-border-default p-6 md:p-8 transition-colors">
                        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                            <UserIcon size={20} className="text-blue-500" />
                            Personal Information
                        </h3>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:bg-bg-surface focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Role / Title</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:bg-bg-surface focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Mail size={12} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    disabled={true}
                                    value={formData.email}
                                    className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm font-medium text-text-secondary cursor-not-allowed outline-none select-none opacity-80"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Briefcase size={12} /> Bio
                                </label>
                                <textarea
                                    disabled={!isEditing}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:bg-bg-surface focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none h-32 disabled:opacity-70 disabled:cursor-not-allowed"
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="bg-bg-surface rounded-[24px] shadow-sm border border-border-default p-6 md:p-8 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-text-primary">Preferences</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-bg-canvas/50 border border-border-default rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-amber-400 text-white'}`}>
                                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                    </div>
                                    <span className="text-sm font-bold text-text-primary">Dark Mode</span>
                                </div>

                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-bg-canvas/50 border border-border-default rounded-xl opacity-60 pointer-events-none">
                                <span className="text-sm font-medium text-text-secondary">Email Notifications</span>
                                <div className="w-10 h-6 bg-gray-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
