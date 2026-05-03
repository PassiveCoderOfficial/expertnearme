'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link as LinkIcon,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Minus,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const btn = (active: boolean) =>
  `p-1.5 rounded-lg text-sm transition-colors ${active ? 'bg-orange-500/20 text-orange-300' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`;

export default function RichTextEditor({ value, onChange, placeholder = 'Write your content here…' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-orange-400 underline' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-xl my-4' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] focus:outline-none px-4 py-4 text-slate-200 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_a]:text-orange-400 [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_code]:bg-slate-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-orange-300 [&_code]:text-sm [&_pre]:bg-slate-900 [&_pre]:rounded-xl [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. initial load)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL:', editor.getAttributes('link').href ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active = false, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title} className={btn(active)}>{children}</button>
  );

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden focus-within:border-orange-500/50 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-700 bg-slate-800/60">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-5 bg-slate-700 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-5 bg-slate-700 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-5 bg-slate-700 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><Code className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-5 bg-slate-700 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center"><AlignCenter className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight className="w-4 h-4" /></ToolBtn>
        <span className="w-px h-5 bg-slate-700 mx-1" />

        <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Insert link"><LinkIcon className="w-4 h-4" /></ToolBtn>
        <ToolBtn onClick={addImage} title="Insert image"><ImageIcon className="w-4 h-4" /></ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
