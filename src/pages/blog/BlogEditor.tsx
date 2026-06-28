import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bold, Italic, Underline, List, ListOrdered, Link2, ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Eye, Edit3, Save, ArrowLeft,
  ChevronDown, Tag, X, Loader2,
} from "lucide-react";
import { apiService, type BlogCategory } from "../../services/api";

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

interface BlogFormData {
  title: string;
  description: string;
  content: string;
  published: boolean;
  enable_toc: boolean;
  category_id: number | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// TOOLBAR BUTTON
// ──────────────────────────────────────────────────────────────────────────────

const ToolbarBtn: React.FC<{
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, active = false, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`p-2 rounded transition-colors ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {children}
  </button>
);

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY DROPDOWN
// ──────────────────────────────────────────────────────────────────────────────

const CategoryDropdown: React.FC<{
  categories: BlogCategory[];
  selectedId: number | null;
  onChange: (id: number | null) => void;
  isLoading: boolean;
}> = ({ categories, selectedId, onChange, isLoading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 bg-white text-sm font-medium transition-all ${
          open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-500 flex-shrink-0" />
          {isLoading ? (
            <span className="text-gray-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading categories…
            </span>
          ) : selected ? (
            <span className="text-gray-800">{selected.name}</span>
          ) : (
            <span className="text-gray-400">Select a category</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !isLoading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Clear option */}
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
              selectedId === null ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-500"
            }`}
          >
            <X className="w-3.5 h-3.5" />
            No category
          </button>
          <div className="border-t border-gray-100" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { onChange(cat.id); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                selectedId === cat.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {cat.post_count} {cat.post_count === 1 ? "post" : "posts"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// IMAGE PREVIEW FIELD
// ──────────────────────────────────────────────────────────────────────────────

const ImageField: React.FC<{
  label: string;
  name: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}> = ({ label, name, preview, onChange, onClear }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    {preview ? (
      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
        <img src={preview} alt={label} className="w-full h-40 object-cover" />
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">Click to upload</span>
        <input type="file" name={name} accept="image/*" className="hidden" onChange={onChange} />
      </label>
    )}
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// RICH TEXT EDITOR TOOLBAR
// ──────────────────────────────────────────────────────────────────────────────

const useExecCommand = (editorRef: React.RefObject<HTMLDivElement | null>) => {
  return useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }, [editorRef]);
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

const BlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const isEdit = Boolean(slug);

  // ── State ─────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    description: "",
    content: "",
    published: false,
    enable_toc: true,
    category_id: null,
  });

  const [categories, setCategories]     = useState<BlogCategory[]>([]);
  const [isCatLoading, setIsCatLoading] = useState(true);

  const [featuredImage, setFeaturedImage]   = useState<File | null>(null);
  const [image1, setImage1]                 = useState<File | null>(null);
  const [image2, setImage2]                 = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [image1Preview, setImage1Preview]   = useState<string | null>(null);
  const [image2Preview, setImage2Preview]   = useState<string | null>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [error, setError]         = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const exec = useExecCommand(editorRef);

  // ── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const cats = await apiService.getBlogCategories();
        setCategories(cats);
      } catch {
        // non-critical; user can still save without category
      } finally {
        setIsCatLoading(false);
      }
    })();
  }, []);

  // ── Load existing post (edit mode) ────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        setIsLoading(true);
        const post = await apiService.getBlogPost(slug);
        setFormData({
          title:       (post as any).title        ?? "",
          description: (post as any).description  ?? "",
          content:     (post as any).content      ?? "",
          published:   (post as any).published    ?? false,
          enable_toc:  (post as any).enable_toc   ?? true,
          category_id: post.category?.id          ?? null,
        });
        if (post.featured_image) setFeaturedPreview(post.featured_image);
        if (post.image_1)        setImage1Preview(post.image_1);
        if (post.image_2)        setImage2Preview(post.image_2);
        if (editorRef.current) {
          editorRef.current.innerHTML = (post as any).content ?? "";
        }
      } catch {
        setError("Failed to load post.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [slug]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const clearImage = (
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setter(null);
    previewSetter(null);
  };

  const syncContent = () => {
    if (editorRef.current) {
      setFormData((prev) => ({ ...prev, content: editorRef.current!.innerHTML }));
    }
  };

  // ── Link insertion ────────────────────────────────────────────────────────
  const insertLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) { setError("Title is required."); return; }
    if (!formData.description.trim()) { setError("Description is required."); return; }

    const currentContent = editorRef.current?.innerHTML ?? formData.content;
    if (!currentContent.trim() || currentContent === "<br>") {
      setError("Content is required.");
      return;
    }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("title",       formData.title);
      fd.append("description", formData.description);
      fd.append("content",     currentContent);
      fd.append("published",   String(formData.published));
      fd.append("enable_toc",  String(formData.enable_toc));
      if (formData.category_id !== null) {
        fd.append("category_id", String(formData.category_id));
      }
      if (featuredImage) fd.append("featured_image", featuredImage);
      if (image1)        fd.append("image_1", image1);
      if (image2)        fd.append("image_2", image2);

      if (isEdit && slug) {
        await apiService.updateBlogPost(slug, fd);
      } else {
        await apiService.createBlogPost(fd);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/blog");
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save post.");
    } finally {
      setIsSaving(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ──────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Post" : "New Post"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { syncContent(); setIsPreview((p) => !p); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPreview
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? "Edit" : "Preview"}
            </button>

            <button
              type="submit"
              form="blog-editor-form"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : saveSuccess ? (
                <><Save className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> {isEdit ? "Update" : "Publish"}</>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Success banner ────────────────────────────────────────────────── */}
      {saveSuccess && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            ✓ Post saved successfully. Redirecting…
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isPreview ? (
          /* ── PREVIEW MODE ───────────────────────────────────────────────── */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {featuredPreview && (
              <img src={featuredPreview} alt="Featured" className="w-full h-64 object-cover" />
            )}
            <div className="p-8 max-w-3xl mx-auto">
              {formData.category_id && (
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {categories.find((c) => c.id === formData.category_id)?.name ?? ""}
                </span>
              )}
              <h1 className="text-4xl font-bold text-blue-700 mb-4 leading-tight">
                {formData.title || <span className="text-gray-300">Untitled post</span>}
              </h1>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">{formData.description}</p>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: editorRef.current?.innerHTML ?? formData.content,
                }}
              />
            </div>
          </div>
        ) : (
          /* ── EDIT MODE ──────────────────────────────────────────────────── */
          <form id="blog-editor-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left / main ─────────────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Title */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Post Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleField}
                    placeholder="Enter a compelling title…"
                    className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-0 outline-none resize-none bg-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleField}
                    rows={3}
                    placeholder="A concise summary shown in post listings…"
                    className="w-full text-gray-700 placeholder-gray-300 border-0 outline-none resize-none bg-transparent text-sm leading-relaxed"
                    required
                  />
                </div>

                {/* Rich text editor */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
                    <ToolbarBtn onClick={() => exec("bold")} title="Bold"><Bold className="w-4 h-4" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("italic")} title="Italic"><Italic className="w-4 h-4" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("underline")} title="Underline"><Underline className="w-4 h-4" /></ToolbarBtn>
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <ToolbarBtn onClick={() => exec("formatBlock", "<h2>")} title="Heading 2">
                      <span className="text-xs font-bold">H2</span>
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("formatBlock", "<h3>")} title="Heading 3">
                      <span className="text-xs font-bold">H3</span>
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("formatBlock", "<p>")} title="Paragraph">
                      <span className="text-xs">¶</span>
                    </ToolbarBtn>
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet list"><List className="w-4 h-4" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered className="w-4 h-4" /></ToolbarBtn>
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <ToolbarBtn onClick={() => exec("justifyLeft")} title="Align left"><AlignLeft className="w-4 h-4" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("justifyCenter")} title="Align center"><AlignCenter className="w-4 h-4" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => exec("justifyRight")} title="Align right"><AlignRight className="w-4 h-4" /></ToolbarBtn>
                    <div className="w-px h-5 bg-gray-200 mx-1" />
                    <ToolbarBtn onClick={insertLink} title="Insert link"><Link2 className="w-4 h-4" /></ToolbarBtn>
                  </div>

                  {/* Content area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncContent}
                    data-placeholder="Start writing your post content here…"
                    className="min-h-[400px] p-6 text-gray-700 text-sm leading-relaxed outline-none prose max-w-none
                      [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-300"
                    style={{ wordBreak: "break-word" }}
                  />
                </div>
              </div>

              {/* ── Right / sidebar ─────────────────────────────────────── */}
              <div className="space-y-5">

                {/* Category */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" /> Category
                  </h3>
                  <CategoryDropdown
                    categories={categories}
                    selectedId={formData.category_id}
                    onChange={(id) => setFormData((prev) => ({ ...prev, category_id: id }))}
                    isLoading={isCatLoading}
                  />
                  {formData.category_id === null && !isCatLoading && (
                    <p className="mt-2 text-xs text-gray-400">
                      Posts without a category appear under "General Health".
                    </p>
                  )}
                </div>

                {/* Publish settings */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700">Settings</h3>

                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Publish</p>
                      <p className="text-xs text-gray-400">Make this post visible to readers</p>
                    </div>
                    <div
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, published: !prev.published }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                        formData.published ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          formData.published ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>

                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Table of Contents</p>
                      <p className="text-xs text-gray-400">Auto-generate from headings</p>
                    </div>
                    <div
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, enable_toc: !prev.enable_toc }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                        formData.enable_toc ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          formData.enable_toc ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Images */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" /> Images
                  </h3>
                  <ImageField
                    label="Featured Image"
                    name="featured_image"
                    preview={featuredPreview}
                    onChange={(e) => handleImageChange(e, setFeaturedImage, setFeaturedPreview)}
                    onClear={() => clearImage(setFeaturedImage, setFeaturedPreview)}
                  />
                  <ImageField
                    label="Image 1"
                    name="image_1"
                    preview={image1Preview}
                    onChange={(e) => handleImageChange(e, setImage1, setImage1Preview)}
                    onClear={() => clearImage(setImage1, setImage1Preview)}
                  />
                  <ImageField
                    label="Image 2"
                    name="image_2"
                    preview={image2Preview}
                    onChange={(e) => handleImageChange(e, setImage2, setImage2Preview)}
                    onClear={() => clearImage(setImage2, setImage2Preview)}
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default BlogEditor;