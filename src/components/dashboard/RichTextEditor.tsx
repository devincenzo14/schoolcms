"use client";

import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-2 py-1 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="px-2 py-1 text-sm underline hover:bg-gray-200 rounded"
          title="Underline"
        >
          U
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "h2")}
          className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand("formatBlock", "h3")}
          className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
          title="Subheading"
        >
          H3
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400"
        suppressContentEditableWarning
      />
    </div>
  );
}
