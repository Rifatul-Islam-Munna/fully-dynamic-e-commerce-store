"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Columns3,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Rows3,
  Redo2,
  Strikethrough,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";

type RichTextEditorProps = {
  description: string;
  updateField: (field: string, value: string) => void;
  field?: string;
};

const MAX_CHARACTERS = 10000;
const MAX_IMAGES = 8;

function ToolbarButton({
  active = false,
  onClick,
  children,
  disabled = false,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  title: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "default" : "ghost"}
      className="size-8"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

export default function RichTextEditor({
  description,
  updateField,
  field = "description",
}: RichTextEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      CharacterCount.configure({ limit: MAX_CHARACTERS }),
      Placeholder.configure({
        placeholder:
          "Write a clear product description with key benefits and details...",
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
      }),
      Underline,
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: description || "",
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[260px] w-full rounded-b-lg border border-border/70 bg-surface p-4 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring/40 [&_.selectedCell]:bg-primary/10",
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      updateField(field, editorInstance.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const currentContent = editor.getHTML();
    if (description !== currentContent) {
      editor.commands.setContent(description || "", false);
    }
  }, [description, editor]);

  const imageCount = (() => {
    if (!editor) {
      return 0;
    }
    let count = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === "image") {
        count += 1;
      }
    });
    return count;
  })();

  const setLink = () => {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.message || "Failed to upload image");
      }

      editor?.chain().focus().setImage({ src: payload.url }).run();
      sileo.success({ title: "Success", description: "Image uploaded" });
    } catch (error) {
      sileo.error({ title: "Something went wrong", description: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!editor) {
    return null;
  }

  const charCount = editor.storage.characterCount.characters();
  const overLimit = charCount >= MAX_CHARACTERS;

  return (
    <div className="rounded-xl border border-border/70 bg-surface-container-lowest shadow-sm">
      <div className="flex flex-wrap gap-1 border-b border-border/60 bg-surface-container/40 p-2">
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Strike"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <ToolbarButton
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => {
            const didToggle = editor.chain().focus().toggleBlockquote().run();
            if (!didToggle) {
              sileo.error({ title: "Something went wrong", description: "Select text in editor first, then apply blockquote." });
            }
          }}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <ToolbarButton
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <ToolbarButton
          title="Insert link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
        >
          <Unlink className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <ToolbarButton
          title="Insert table"
          active={editor.isActive("table")}
          onClick={() => {
            const didInsert = editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run();
            if (!didInsert) {
              sileo.error({ title: "Something went wrong", description: "Place cursor in editor body, then insert table." });
            }
          }}
        >
          <Table2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Add row"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.isActive("table")}
        >
          <Rows3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Add column"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.isActive("table")}
        >
          <Columns3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Delete table"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.isActive("table")}
        >
          <Trash2 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-8 w-px bg-border" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadImage(file);
            }
          }}
          disabled={isUploadingImage || imageCount >= MAX_IMAGES}
        />
        <Button
          type="button"
          variant="ghost"
          className="h-8 gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage || imageCount >= MAX_IMAGES}
        >
          {isUploadingImage ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImageUp className="size-4" />
          )}
          Image
        </Button>
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between border-t border-border/60 bg-surface-container-low/50 px-3 py-2 text-xs text-on-surface-variant">
        <span>{imageCount} / {MAX_IMAGES} images</span>
        <span className={overLimit ? "font-semibold text-error" : ""}>
          {charCount} / {MAX_CHARACTERS} characters
        </span>
      </div>
    </div>
  );
}



