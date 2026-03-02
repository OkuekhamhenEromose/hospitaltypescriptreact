// components/blog/BlogEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Loader, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageSlot {
  file:     File | null;
  preview:  string | null;  // local blob URL for new selection
  existing: string | null;  // presigned URL from server (edit mode)
  name:     string | null;
}
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
const emptySlot = (): ImageSlot => ({ file: null, preview: null, existing: null, name: null });

const BlogEditor: React.FC = () => {
  const { slug }  = useParams<{ slug?: string }>();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [loading,      setLoading]      = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorDetail,  setErrorDetail]  = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', content: '', published: false, enable_toc: true,
  });
  const [featured, setFeatured] = useState<ImageSlot>(emptySlot());
  const [img1,     setImg1]     = useState<ImageSlot>(emptySlot());
  const [img2,     setImg2]     = useState<ImageSlot>(emptySlot());

  const blobUrls = useRef<string[]>([]);
  useEffect(() => () => blobUrls.current.forEach(URL.revokeObjectURL), []);

  const isEdit = !!slug;

  useEffect(() => { if (isEdit && slug) loadBlogPost(slug); }, [isEdit, slug]);

  const loadBlogPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const post = await apiService.getBlogPost(postSlug);
      setFormData({
        title: post.title, description: post.description,
        content: post.content, published: post.published,
        enable_toc: post.enable_toc ?? true,
      });
      // Store existing presigned URLs so previews show without re-uploading
      setFeatured(s => ({ ...s, existing: post.featured_image || null }));
      setImg1(s    => ({ ...s, existing: post.image_1        || null }));
      setImg2(s    => ({ ...s, existing: post.image_2        || null }));
    } catch (err: any) {
      setErrorDetail(err?.message ?? 'Failed to load blog post.');
      setUploadStatus('error');
    } finally { setLoading(false); }
  };

  const handleFileChange = (
    setter: React.Dispatch<React.SetStateAction<ImageSlot>>,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(prev => { if (prev.preview) URL.revokeObjectURL(prev.preview); return prev; });
    const preview = URL.createObjectURL(file);
    blobUrls.current.push(preview);
    setter({ file, preview, existing: null, name: file.name });
    if (uploadStatus === 'error') { setUploadStatus('idle'); setErrorDetail(''); }
  };

  const clearSlot = (setter: React.Dispatch<React.SetStateAction<ImageSlot>>) => () =>
    setter(prev => { if (prev.preview) URL.revokeObjectURL(prev.preview); return emptySlot(); });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.profile?.role !== 'ADMIN') {
      setErrorDetail('Only admins can create or edit blog posts.'); setUploadStatus('error'); return;
    }
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      setErrorDetail('Please fill in title, description, and content.'); setUploadStatus('error'); return;
    }
    if (!isEdit && !featured.file) {
      setErrorDetail('A featured image is required for new posts.'); setUploadStatus('error'); return;
    }
    setUploadStatus('uploading'); setErrorDetail('');
    try {
      const fd = new FormData();
      fd.append('title',       formData.title);
      fd.append('description', formData.description);
      fd.append('content',     formData.content);
      fd.append('published',   String(formData.published));
      fd.append('enable_toc',  String(formData.enable_toc));

      // CRITICAL: Only append image fields when a new file was actually selected.
      // Appending an empty file input sends an empty InMemoryUploadedFile to
      // Django which overwrites the DB path with blank — deleting the existing image.
      if (featured.file) fd.append('featured_image', featured.file);
      if (img1.file)     fd.append('image_1',        img1.file);
      if (img2.file)     fd.append('image_2',        img2.file);

      if (isEdit && slug) {
        await apiService.updateBlogPost(slug, fd);  // uses PATCH — only updates provided fields
      } else {
        await apiService.createBlogPost(fd);
      }
      setUploadStatus('success');
      setTimeout(() => navigate('/admin/dashboard'), 1400);
    } catch (err: any) {
      // Expose the real error rather than a generic message
      setErrorDetail(err?.message ?? 'Unexpected error — check the browser Network tab.');
      setUploadStatus('error');
    }
  };

  // ── Image slot sub-component ────────────────────────────────────────────────
  const ImageSlotInput: React.FC<{
    label: string; required?: boolean;
    slot: ImageSlot; setter: React.Dispatch<React.SetStateAction<ImageSlot>>; inputId: string;
  }> = ({ label, required, slot, setter, inputId }) => {
    const displayUrl = slot.preview ?? slot.existing ?? null;
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {displayUrl ? (
          <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
            <img src={displayUrl} alt={label} className="w-full h-full object-cover" />
            <span className={`absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
              slot.file ? 'bg-blue-600 text-white' : 'bg-black/50 text-white'
            }`}>
              {slot.file ? '✓ Ready to upload' : 'Current'}
            </span>
            <button type="button" onClick={clearSlot(setter)}
              className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-0.5 shadow">
              <X className="w-3.5 h-3.5 text-gray-700" />
            </button>
          </div>
        ) : (
          <label htmlFor={inputId}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload className="w-5 h-5 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">Click to select image</span>
          </label>
        )}
        {slot.file && (
          <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-1 truncate" title={slot.name ?? ''}>
            📎 {slot.name}  ({(slot.file.size / 1024).toFixed(0)} KB)
          </p>
        )}
        {!slot.file && slot.existing && (
          <p className="text-xs text-gray-400 italic">Existing image kept (no new file selected).</p>
        )}
        <input id={inputId} type="file" accept="image/*"
          onChange={handleFileChange(setter)} className="sr-only" />
      </div>
    );
  };

  const isSaving      = uploadStatus === 'uploading';
  const newFileCount  = [featured.file, img1.file, img2.file].filter(Boolean).length;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader className="w-6 h-6 animate-spin text-blue-600 mr-3" />
      <span className="text-gray-600">Loading blog post…</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button type="button" onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" /><span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isEdit
              ? 'Leave image slots empty to keep existing images.'
              : 'A featured image is required for new posts.'}
          </p>
        </div>

        {/* Status banner */}
        {uploadStatus !== 'idle' && (() => {
          const cfg = {
            uploading: { cls: 'bg-blue-50 border-blue-200 text-blue-800', icon: <Loader className="w-4 h-4 animate-spin flex-shrink-0" />, msg: 'Uploading images to S3 and saving… please wait.' },
            success:   { cls: 'bg-green-50 border-green-200 text-green-800', icon: <CheckCircle className="w-4 h-4 flex-shrink-0" />, msg: isEdit ? 'Post updated! Redirecting…' : 'Post created! Redirecting…' },
            error:     { cls: 'bg-red-50 border-red-200 text-red-800', icon: <AlertCircle className="w-4 h-4 flex-shrink-0" />, msg: errorDetail },
            idle:      { cls: '', icon: null, msg: '' },
          }[uploadStatus];
          return (
            <div className={`flex items-start gap-2 border rounded-md px-4 py-3 text-sm mb-4 ${cfg.cls}`}>
              {cfg.icon}<span>{cfg.msg}</span>
            </div>
          );
        })()}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input type="text" id="title" name="title" required
                value={formData.title} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter blog post title" />
            </div>
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea id="description" name="description" required rows={4}
                value={formData.description} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description shown on the blog listing" />
            </div>
            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea id="content" name="content" required rows={15}
                value={formData.content} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder={'<h2>First Section</h2>\n<p>Your content...</p>\n\n<h2>Second Section</h2>\n<p>More content...</p>'} />
              <p className="mt-1 text-xs text-gray-500">HTML h1–h6 tags are extracted for the Table of Contents.</p>
            </div>
            {/* Images */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Images
                {newFileCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {newFileCount} file{newFileCount > 1 ? 's' : ''} selected — will upload on save
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ImageSlotInput label="Featured Image" required={!isEdit} slot={featured} setter={setFeatured} inputId="featured_image" />
                <ImageSlotInput label="Additional Image 1" slot={img1} setter={setImg1} inputId="image_1" />
                <ImageSlotInput label="Additional Image 2" slot={img2} setter={setImg2} inputId="image_2" />
              </div>
            </div>
            {/* Toggles */}
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="published" checked={formData.published} onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="enable_toc" checked={formData.enable_toc} onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Enable Table of Contents</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {newFileCount > 0
                ? `${newFileCount} image${newFileCount > 1 ? 's' : ''} queued for S3 upload`
                : isEdit ? 'No images changed' : 'No images selected'}
            </span>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/admin/dashboard')} disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isSaving || uploadStatus === 'success'}
                className="flex items-center space-x-2 px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {isSaving
                  ? <><Loader className="w-4 h-4 animate-spin" /><span>Uploading to S3…</span></>
                  : uploadStatus === 'success'
                  ? <><CheckCircle className="w-4 h-4" /><span>Saved!</span></>
                  : <><Save className="w-4 h-4" /><span>{isEdit ? 'Update Post' : 'Create Post'}</span></>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;