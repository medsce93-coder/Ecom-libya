import { useEditor, EditorContent } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Palette,
  Plus,
  Redo2,
  Strikethrough,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

type ProductRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const ProductVideo = Node.create({
  name: "productVideo",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      poster: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: true,
        preload: "metadata",
        class: "my-4 w-full max-w-2xl rounded-2xl",
      }),
    ];
  },
});

function ToolbarButton({
  active = false,
  disabled = false,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={[
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 transition-colors",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-200 hover:text-slate-900",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px bg-slate-200" />;
}

export function ProductRichTextEditor({
  value,
  onChange,
  disabled = false,
}: ProductRichTextEditorProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: false,
      }),
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ProductVideo,
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "min-h-[320px] px-5 py-5 text-right text-[15px] leading-8 text-slate-700 outline-none " +
          "prose prose-slate max-w-none " +
          "[&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mb-4 " +
          "[&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mb-3 " +
          "[&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-slate-900 [&_h3]:mb-2 " +
          "[&_p]:my-2 " +
          "[&_ul]:pr-6 [&_ol]:pr-6 " +
          "[&_a]:text-primary [&_a]:underline " +
          "[&_img]:mx-auto [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-2xl " +
          "[&_table]:w-full [&_table]:border-collapse [&_table]:my-5 " +
          "[&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 " +
          "[&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();

    if (value !== currentHtml && value !== undefined) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!fullscreen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [fullscreen]);

  if (!editor) {
    return (
      <div className="min-h-[380px] rounded-2xl border-2 border-slate-200 bg-white animate-pulse" />
    );
  }

  const handleUpload = async (
    file: File,
    kind: "image" | "video",
  ) => {
    setUploading(kind);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await apiFetch<{
        url?: string;
        publicUrl?: string;
        path?: string;
      }>("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadedUrl = result?.url || result?.publicUrl || result?.path;

      if (!uploadedUrl) {
        throw new Error("Upload response did not contain a media URL");
      }

      if (kind === "image") {
        editor
          .chain()
          .focus()
          .setImage({
            src: String(uploadedUrl),
            alt: "صورة المنتج",
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "productVideo",
            attrs: {
              src: String(uploadedUrl),
            },
          })
          .run();
      }
    } catch (error) {
      console.error("Product rich content media upload failed", error);

      const message =
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : "Unknown upload error";

      const cleanMessage = message.replace(/^API\s+\d+:\s*/i, "").trim();

      window.alert(`Upload failed: ${cleanMessage || "Unknown error"}`);
    } finally {
      setUploading(null);
    }
  };

  const handleImageInput = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    await handleUpload(file, "image");
  };

  const handleVideoInput = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    await handleUpload(file, "video");
  };

  const insertImageFromUrl = () => {
    const url = window.prompt("أدخل رابط الصورة");

    if (!url?.trim()) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: url.trim(),
        alt: "صورة المنتج",
      })
      .run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt(
      "أدخل الرابط",
      previousUrl,
    );

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .setLink({
        href: url.trim(),
      })
      .run();
  };

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const clearFormatting = () => {
    editor
      .chain()
      .focus()
      .clearNodes()
      .unsetAllMarks()
      .run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({
        rows: 3,
        cols: 3,
        withHeaderRow: true,
      })
      .run();
  };

  const outerClass = fullscreen
    ? "fixed inset-0 z-[100] flex h-screen w-screen flex-col bg-white"
    : "overflow-hidden rounded-2xl border-2 border-slate-200 bg-white focus-within:border-primary";

  return (
    <>
      <div className={outerClass}>
        <div
          dir="rtl"
          className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2"
        >
          <ToolbarButton
            title="غامق"
            active={editor.isActive("bold")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="مائل"
            active={editor.isActive("italic")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="تحته خط"
            active={editor.isActive("underline")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="يتوسطه خط"
            active={editor.isActive("strike")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <select
            value={
              editor.isActive("heading", { level: 1 })
                ? "h1"
                : editor.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor.isActive("heading", { level: 3 })
                    ? "h3"
                    : "p"
            }
            disabled={disabled}
            onChange={(event) => {
              const level = event.target.value;

              if (level === "p") {
                editor.chain().focus().setParagraph().run();
              } else {
                editor
                  .chain()
                  .focus()
                  .toggleHeading({
                    level: Number(level.replace("h", "")) as 1 | 2 | 3,
                  })
                  .run();
              }
            }}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none"
            title="نوع النص"
          >
            <option value="p">نص</option>
            <option value="h1">عنوان 1</option>
            <option value="h2">عنوان 2</option>
            <option value="h3">عنوان 3</option>
          </select>

          <ToolbarDivider />

          <ToolbarButton
            title="قائمة نقطية"
            active={editor.isActive("bulletList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="قائمة مرقمة"
            active={editor.isActive("orderedList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="محاذاة يمين"
            active={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="توسيط"
            active={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="محاذاة يسار"
            active={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="رابط"
            active={editor.isActive("link")}
            disabled={disabled}
            onClick={setLink}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>

          <label
            title="رفع صورة"
            className={[
              "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2 text-slate-600 transition-colors hover:bg-slate-200",
              disabled || uploading ? "pointer-events-none opacity-40" : "",
            ].join(" ")}
          >
            {uploading === "image" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml"
              className="hidden"
              disabled={disabled || uploading !== null}
              onChange={handleImageInput}
            />
          </label>

          <ToolbarButton
            title="إضافة صورة من رابط"
            disabled={disabled}
            onClick={insertImageFromUrl}
          >
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>

          <label
            title="رفع فيديو"
            className={[
              "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2 text-slate-600 transition-colors hover:bg-slate-200",
              disabled || uploading ? "pointer-events-none opacity-40" : "",
            ].join(" ")}
          >
            {uploading === "video" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            ) : (
              <Video className="h-4 w-4" />
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              disabled={disabled || uploading !== null}
              onChange={handleVideoInput}
            />
          </label>

          <ToolbarDivider />

          <label
            title="لون النص"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200"
          >
            <Palette className="h-4 w-4" />
            <input
              type="color"
              className="absolute h-0 w-0 opacity-0"
              defaultValue="#111827"
              onChange={(event) => setTextColor(event.target.value)}
            />
          </label>

          <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1">
            {["#111827", "#dc2626", "#2563eb", "#059669", "#d97706"].map(
              (color) => (
                <button
                  key={color}
                  type="button"
                  title={`لون ${color}`}
                  disabled={disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setTextColor(color)}
                  className="h-5 w-5 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ),
            )}
          </div>

          <ToolbarDivider />

          <ToolbarButton
            title="إضافة جدول"
            disabled={disabled}
            onClick={insertTable}
          >
            <Table2 className="h-4 w-4" />
          </ToolbarButton>

          {editor.isActive("table") && (
            <>
              <ToolbarButton
                title="إضافة صف"
                disabled={disabled}
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <Plus className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                title="إضافة عمود"
                disabled={disabled}
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <Plus className="h-4 w-4 rotate-90" />
              </ToolbarButton>

              <ToolbarButton
                title="حذف الجدول"
                disabled={disabled}
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 className="h-4 w-4" />
              </ToolbarButton>
            </>
          )}

          <ToolbarDivider />

          <ToolbarButton
            title="مسح التنسيق"
            disabled={disabled}
            onClick={clearFormatting}
          >
            <Eraser className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="تراجع"
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="إعادة"
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title={fullscreen ? "إغلاق ملء الشاشة" : "ملء الشاشة"}
            disabled={disabled}
            onClick={() => setFullscreen((current) => !current)}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </ToolbarButton>
        </div>

        <div className="relative flex-1 overflow-auto">
          <EditorContent editor={editor} />
          {uploading && (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              جارٍ رفع {uploading === "image" ? "الصورة" : "الفيديو"}…
            </div>
          )}
        </div>
      </div>

      {fullscreen && (
        <div className="fixed bottom-3 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xl">
          اضغط Esc للخروج من ملء الشاشة
        </div>
      )}
    </>
  );
}
