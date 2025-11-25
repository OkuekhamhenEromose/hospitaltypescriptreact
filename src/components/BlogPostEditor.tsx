// // components/BlogPostEditor.tsx
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { apiService } from '../services/api';

// interface BlogPostEditorProps {
//   post?: any; // Existing post for editing
//   onSave?: () => void;
//   onCancel?: () => void;
// }

// const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ post, onSave, onCancel }) => {
//   const { user } = useAuth();
//   const [formData, setFormData] = useState({
//     title: post?.title || '',
//     description: post?.description || '',
//     content: post?.content || '',
//     featured_image: null as File | null,
//     published: post?.published || false,
//     enable_toc: post?.enable_toc ?? true,
//   });
//   const [previewToc, setPreviewToc] = useState<any[]>([]);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (formData.content && formData.enable_toc) {
//       generateTocPreview();
//     }
//   }, [formData.content, formData.enable_toc]);

//   const generateTocPreview = () => {
//     const headingPattern = /<h([1-6])[^>]*>(.*?)<\/h\1>/g;
//     const headings = [...formData.content.matchAll(headingPattern)];
    
//     const toc = headings.map((match, index) => {
//       const level = match[1];
//       const title = match[2].replace(/<[^>]+>/g, '').trim();
//       return {
//         id: index + 1,
//         title: title,
//         level: parseInt(level),
//         anchor: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
//       };
//     });
    
//     setPreviewToc(toc);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       const submitData = new FormData();
//       submitData.append('title', formData.title);
//       submitData.append('description', formData.description);
//       submitData.append('content', formData.content);
//       submitData.append('published', formData.published.toString());
//       submitData.append('enable_toc', formData.enable_toc.toString());
      
//       if (formData.featured_image) {
//         submitData.append('featured_image', formData.featured_image);
//       }

//       if (post) {
//         // Update existing post
//         await apiService.updateBlogPost(post.slug, submitData);
//       } else {
//         // Create new post
//         await apiService.createBlogPost(submitData);
//       }

//       if (onSave) {
//         onSave();
//       }
//     } catch (error) {
//       console.error('Error saving blog post:', error);
//       alert('Error saving blog post. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFormData({ ...formData, featured_image: e.target.files[0] });
//     }
//   };
//   const isAdmin = user?.profile?.role === "ADMIN"
//   if (!isAdmin) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-xl text-red-600">Access denied. Admin role required.</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">
//               {post ? 'Edit Blog Post' : 'Create New Blog Post'}
//             </h2>
//             <button
//               onClick={onCancel}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               Cancel
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Title
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.title}
//                 onChange={(e) => setFormData({...formData, title: e.target.value})}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter blog post title"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Description
//               </label>
//               <textarea
//                 required
//                 value={formData.description}
//                 onChange={(e) => setFormData({...formData, description: e.target.value})}
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Brief description of the blog post"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Content (Use HTML headings for TOC)
//               </label>
//               <textarea
//                 required
//                 value={formData.content}
//                 onChange={(e) => setFormData({...formData, content: e.target.value})}
//                 rows={15}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
//                 placeholder="Use &lt;h1&gt; to &lt;h6&gt; tags for headings. These will be automatically included in the table of contents."
//               />
//               <p className="mt-1 text-sm text-gray-500">
//                 Use HTML heading tags (&lt;h1&gt; to &lt;h6&gt;) to structure your content. 
//                 These will automatically generate the table of contents.
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Featured Image
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 className="w-full"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={formData.published}
//                   onChange={(e) => setFormData({...formData, published: e.target.checked})}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label className="ml-2 block text-sm text-gray-900">
//                   Publish immediately
//                 </label>
//               </div>

//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={formData.enable_toc}
//                   onChange={(e) => setFormData({...formData, enable_toc: e.target.checked})}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label className="ml-2 block text-sm text-gray-900">
//                   Enable Table of Contents
//                 </label>
//               </div>
//             </div>

//             {/* TOC Preview */}
//             {formData.enable_toc && previewToc.length > 0 && (
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <h4 className="text-lg font-semibold mb-3">Table of Contents Preview</h4>
//                 <ul className="space-y-1">
//                   {previewToc.map((item) => (
//                     <li 
//                       key={item.id}
//                       className="text-sm text-gray-600"
//                       style={{ marginLeft: `${(item.level - 1) * 16}px` }}
//                     >
//                       {item.title}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="flex justify-end space-x-4 pt-6">
//               <button
//                 type="button"
//                 onClick={onCancel}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 disabled={saving}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
//                 disabled={saving}
//               >
//                 {saving ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogPostEditor;