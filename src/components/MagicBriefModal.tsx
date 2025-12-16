import React, { useState, useEffect, useRef } from 'react';
import { X, Wand2, Link as LinkIcon, Image as ImageIcon, Plus, Trash2, Calendar, User, Save, UploadCloud } from 'lucide-react';
import { Button } from './Button';
import { RichTextEditor } from './RichTextEditor';
import { generateStructuredBrief } from '../services/geminiService';
import { Task, Priority, TaskType, Designer, Requester } from '../models';

interface MagicBriefModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (taskData: Partial<Task>) => void;
    designers: Designer[];
    requesters: Requester[];
    activeSprint: string;
}

export const MagicBriefModal: React.FC<MagicBriefModalProps> = ({ isOpen, onClose, onConfirm, designers, requesters, activeSprint }) => {
    const [showMagicInput, setShowMagicInput] = useState(false);
    const [magicText, setMagicText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [magicError, setMagicError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        description: '',
        requester: '',
        manager: '',
        sprint: activeSprint,
        requestDate: new Date().toISOString().split('T')[0],
        priority: Priority.NORMAL,
        type: TaskType.SEARCH_ARB,
        points: 1,
        referenceLinks: [],
        referenceImages: []
    });

    const [selectedDesignerId, setSelectedDesignerId] = useState<string>('');
    const [newLink, setNewLink] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                description: '',
                requester: requesters[0]?.name || '',
                manager: '',
                sprint: activeSprint,
                requestDate: new Date().toISOString().split('T')[0],
                priority: Priority.NORMAL,
                type: TaskType.SEARCH_ARB,
                points: 1,
                referenceLinks: [],
                referenceImages: []
            });
            setSelectedDesignerId('');
            setShowMagicInput(false);
            setMagicText('');
            setMagicError(null);
        }
    }, [isOpen, activeSprint, requesters]);

    const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
        try {
            e.currentTarget.showPicker();
        } catch {
            // Fallback for browsers that don't support showPicker
            console.debug('Date picker not supported, using native input');
        }
    };

    const handleMagicFill = async () => {
        if (!magicText.trim()) return;
        setIsProcessing(true);
        try {
            const result = await generateStructuredBrief(magicText);
            setFormData(prev => ({
                ...prev,
                title: result.title,
                description: result.description,
                requester: result.requester || prev.requester,
                sprint: result.sprint || prev.sprint,
                points: result.sprintPoints,
                type: result.type,
                priority: result.priority,
                referenceLinks: [...(prev.referenceLinks || []), ...(result.referenceLinks || [])]
            }));
            setShowMagicInput(false);
        } catch (e) {
            console.error(e);
            setMagicError('Failed to process request. Please try again or fill manually.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        const designer = designers.find(d => d.id === selectedDesignerId);
        onConfirm({
            ...formData,
            designer: designer
        });
    };

    const addLink = () => {
        if (newLink) {
            setFormData(prev => ({ ...prev, referenceLinks: [...(prev.referenceLinks || []), newLink] }));
            setNewLink('');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    const base64String = reader.result;
                    setFormData(prev => ({
                        ...prev,
                        referenceImages: [...(prev.referenceImages || []), base64String]
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-bg-canvas rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-border-default animate-[floatUp_0.3s_ease-out]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-bg-surface/80 backdrop-blur-md z-10">
                    <h2 className="text-xl font-bold text-text-primary">New Design Task</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="magic"
                            onClick={() => setShowMagicInput(!showMagicInput)}
                            className="py-1.5 px-3 text-xs"
                        >
                            <Wand2 size={14} />
                            {showMagicInput ? 'Cancel Magic' : 'Magic Autofill'}
                        </Button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-surface-hover text-text-secondary" aria-label="Close modal">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto relative">

                    {showMagicInput && (
                        <div className="bg-bg-surface p-6 border-b border-purple-500/20 animate-slideDown">
                            <label className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2 block">Paste unstructured request (Email, Slack, etc.)</label>
                            <textarea
                                className="w-full h-24 p-3 rounded-xl border border-purple-200 dark:border-purple-800 focus:ring-2 focus:ring-purple-500/20 outline-none text-base md:text-sm resize-none mb-3 bg-bg-canvas text-text-primary placeholder:text-text-secondary"
                                placeholder="e.g. Need a Facebook ad for the new Insurance campaign. Make it high contrast. Due tomorrow."
                                value={magicText}
                                onChange={(e) => setMagicText(e.target.value)}
                            />
                            {magicError && (
                                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                                    {magicError}
                                </div>
                            )}
                            <div className="flex justify-end">
                                <Button variant="magic" onClick={handleMagicFill} disabled={isProcessing}>
                                    {isProcessing ? 'Analyzing...' : 'Autofill Form'}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                        {/* Left Column: Core Info */}
                        <div className="space-y-6">
                            <div className="space-y-4 bg-bg-surface p-5 rounded-2xl border border-border-default shadow-sm">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Requirement Details</h3>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Requirement Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary focus:bg-bg-surface focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                        placeholder="e.g. Homepage Redesign V2"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Description</label>
                                    <RichTextEditor
                                        value={formData.description || ''}
                                        onChange={(val) => setFormData({ ...formData, description: val })}
                                        placeholder="Describe the deliverables in detail..."
                                        className="h-32"
                                    />
                                </div>
                            </div>

                            <div className="bg-bg-surface p-5 rounded-2xl border border-border-default shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">People</h3>

                                {/* Requester Select */}
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Requester (Client)</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-3 text-text-secondary" />
                                        <select
                                            className="w-full bg-bg-canvas border border-border-default rounded-xl pl-10 pr-3 py-3 text-sm text-text-primary focus:bg-bg-surface focus:border-blue-500 outline-none transition-all appearance-none"
                                            value={formData.requester}
                                            onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                                        >
                                            <option value="" disabled>Select Requester</option>
                                            {requesters.map(r => (
                                                <option key={r.id} value={r.name}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Designer Select */}
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-1.5">Designer (Assignee)</label>
                                    <select
                                        className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:bg-bg-surface focus:border-blue-500"
                                        value={selectedDesignerId}
                                        onChange={(e) => setSelectedDesignerId(e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {designers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Meta & References */}
                        <div className="space-y-6">

                            <div className="bg-bg-surface p-5 rounded-2xl border border-border-default shadow-sm">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Planning</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Request Date</label>
                                        <div className="relative">
                                            <Calendar size={18} className="absolute left-3 top-3 text-text-secondary pointer-events-none" />
                                            <input
                                                type="date"
                                                onClick={openDatePicker}
                                                className="w-full bg-bg-canvas border border-border-default rounded-xl pl-10 pr-2 py-3 text-sm text-text-primary outline-none cursor-pointer focus:bg-bg-surface focus:border-blue-500"
                                                value={formData.requestDate}
                                                onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Sprint</label>
                                        <input
                                            type="text"
                                            className="w-full bg-bg-canvas border border-border-default rounded-xl px-4 py-3 text-sm outline-none font-medium text-text-secondary cursor-not-allowed"
                                            value={formData.sprint}
                                            disabled
                                        // onChange={(e) => setFormData({...formData, sprint: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Priority</label>
                                        <select
                                            className="w-full bg-bg-canvas border border-border-default rounded-xl px-3 py-3 text-sm text-text-primary outline-none focus:bg-bg-surface focus:border-blue-500"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                        >
                                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary mb-1.5">Type</label>
                                        <select
                                            className="w-full bg-bg-canvas border border-border-default rounded-xl px-3 py-3 text-sm text-text-primary outline-none focus:bg-bg-surface focus:border-blue-500"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                                        >
                                            {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-bg-surface p-5 rounded-2xl border border-border-default shadow-sm space-y-4">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">References</h3>

                                {/* Links */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                                        <LinkIcon size={14} /> External Links
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            className="flex-1 bg-bg-canvas border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:bg-bg-surface focus:border-blue-500"
                                            value={newLink}
                                            onChange={(e) => setNewLink(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addLink()}
                                        />
                                        <button onClick={addLink} className="p-2.5 bg-bg-canvas border border-border-default rounded-xl hover:bg-bg-surface-hover text-text-primary" aria-label="Add link">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <ul className="space-y-2 mt-2">
                                        {formData.referenceLinks?.map((link, idx) => (
                                            <li key={idx} className="flex items-center justify-between text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                                                <span className="truncate max-w-[200px]">{link}</span>
                                                <button
                                                    onClick={() => {
                                                        const newLinks = [...(formData.referenceLinks || [])];
                                                        newLinks.splice(idx, 1);
                                                        setFormData({ ...formData, referenceLinks: newLinks });
                                                    }}
                                                    aria-label="Remove link"
                                                ><Trash2 size={14} /></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Images Upload */}
                                <div className="space-y-2 pt-2 border-t border-dashed border-border-default">
                                    <label className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                                        <ImageIcon size={14} /> Reference Images (Upload)
                                    </label>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border-default rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-bg-canvas transition-colors"
                                    >
                                        <UploadCloud size={24} className="text-text-secondary mb-1" />
                                        <span className="text-xs text-text-secondary">Click to upload image</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>

                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {formData.referenceImages?.map((img, idx) => (
                                            <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                                                <img src={img} alt="ref" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => {
                                                        const newImgs = [...(formData.referenceImages || [])];
                                                        newImgs.splice(idx, 1);
                                                        setFormData({ ...formData, referenceImages: newImgs });
                                                    }}
                                                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-default bg-bg-surface/80 backdrop-blur-md flex justify-end gap-3 z-10">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={!formData.title?.trim()}>
                        <Save size={18} />
                        Create Task
                    </Button>
                </div>

            </div>
        </div>
    );
};
