import { Button } from "@heroui/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Markdown } from "tiptap-markdown";
import { BoldIcon, BulletListIcon, ItalicIcon } from "./icons";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

// Thin Tiptap wrapper for the task description field. ProseMirror only ever
// serializes nodes/marks it created within this schema, so the resulting
// HTML is safe to render back without a separate sanitization pass.
export function RichTextEditor({
    content,
    onChange,
    placeholder = "Add more details...",
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: { openOnClick: false, autolink: true },
            }),
            Markdown,
        ],
        content,
        editorProps: {
            attributes: {
                class: "min-h-20 max-h-48 overflow-y-auto px-3 py-2 text-sm text-white outline-none [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-accent [&_a]:underline",
                "aria-label": placeholder,
            },
        },
        onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    });

    // Keep the editor in sync when switching between tasks (e.g. opening a
    // different task to edit) without fighting the user's active typing.
    useEffect(() => {
        if (!editor) return;
        if (editor.getHTML() !== content) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, content]);

    if (!editor) return null;

    return (
        <div className="rounded-lg border border-border bg-surface">
            <div className="flex gap-1 border-b border-border p-1.5">
                <Button
                    isIconOnly
                    size="sm"
                    variant={editor.isActive("bold") ? "secondary" : "ghost"}
                    aria-label="Bold"
                    aria-pressed={editor.isActive("bold")}
                    onPress={() => editor.chain().focus().toggleBold().run()}
                >
                    <BoldIcon className="size-4" />
                </Button>
                <Button
                    isIconOnly
                    size="sm"
                    variant={editor.isActive("italic") ? "secondary" : "ghost"}
                    aria-label="Italic"
                    aria-pressed={editor.isActive("italic")}
                    onPress={() => editor.chain().focus().toggleItalic().run()}
                >
                    <ItalicIcon className="size-4" />
                </Button>
                <Button
                    isIconOnly
                    size="sm"
                    variant={
                        editor.isActive("bulletList") ? "secondary" : "ghost"
                    }
                    aria-label="Bullet list"
                    aria-pressed={editor.isActive("bulletList")}
                    onPress={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    <BulletListIcon className="size-4" />
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
