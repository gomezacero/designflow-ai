import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    return (
        <div className={`rich-text-editor-wrapper ${className || ''}`}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-bg-canvas rounded-xl overflow-hidden border border-border-default focus-within:ring-2 focus-within:ring-blue-500/20 transition-all text-text-primary"
            />
            <style>{`
                .rich-text-editor-wrapper .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid var(--border-default, #e5e7eb);
                    background: var(--bg-surface, #f9fafb);
                    padding: 8px;
                }
                
                .rich-text-editor-wrapper .ql-container.ql-snow {
                    border: none;
                    font-family: inherit;
                    font-size: 0.875rem;
                }

                .rich-text-editor-wrapper .ql-editor {
                    min-height: 120px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 1rem;
                    color: var(--text-primary, #111827);
                }

                .rich-text-editor-wrapper .ql-editor.ql-blank::before {
                    color: var(--text-secondary, #6b7280);
                    font-style: normal;
                }

                /* Dark mode adaptation helpers - assuming CSS variables usually work, but Quill SVGs use inline stroke/fill */
                :global(.dark) .rich-text-editor-wrapper .ql-stroke {
                    stroke: #9CA3AF !important;
                }
                :global(.dark) .rich-text-editor-wrapper .ql-fill {
                    fill: #9CA3AF !important;
                }
                :global(.dark) .rich-text-editor-wrapper .ql-picker {
                    color: #9CA3AF !important;
                }
                :global(.dark) .rich-text-editor-wrapper .ql-picker-options {
                    background-color: #1F2937 !important;
                    border: 1px solid #374151 !important;
                }
                
                /* Override borders from default theme */
                .ql-toolbar.ql-snow, .ql-container.ql-snow {
                    border-color: transparent !important;
                }
                
                /* Add Tailwind colors via style tag since we can't easily access tailwind config here */
                .dark .rich-text-editor-wrapper .ql-stroke { stroke: #9ca3af; }
                .dark .rich-text-editor-wrapper .ql-fill { fill: #9ca3af; }
                .dark .rich-text-editor-wrapper .ql-picker { color: #9ca3af; }
             `}</style>
        </div>
    );
};
