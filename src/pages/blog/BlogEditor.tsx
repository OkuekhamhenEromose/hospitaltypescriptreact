// components/blog/BlogEditor.tsx - Enhanced version
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Loader } from 'lucide-react';

const BlogEditor: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    published: false,
    enable_toc: true,
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [currentImages, setCurrentImages] = useState({
    featured_image: '',
    image_1: '',
    image_2: ''
  });

  const isEdit = !!slug;

  useEffect(() => {
    if (isEdit && slug) {
      loadBlogPost(slug);
    }
  }, [isEdit, slug]);

  const loadBlogPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const post = await apiService.getBlogPost(postSlug);
      setFormData({
        title: post.title,
        description: post.description,
        content: post.content,
        published: post.published,
        enable_toc: post.enable_toc,
      });
      setCurrentImages({
        featured_image: post.featured_image || '',
        image_1: post.image_1 || '',
        image_2: post.image_2 || ''
      });
    } catch (error) {
      console.error('Error loading blog post:', error);
      alert('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      switch (field) {
        case 'featured_image':
          setFeaturedImage(file);
          break;
        case 'image_1':
          setImage1(file);
          break;
        case 'image_2':
          setImage2(file);
          break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.profile || user.profile.role !== 'ADMIN') {
      alert('Only admins can create or edit blog posts');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('published', formData.published.toString());
      formDataToSend.append('enable_toc', formData.enable_toc.toString());
      
      if (featuredImage) {
        formDataToSend.append('featured_image', featuredImage);
      }
      if (image1) {
        formDataToSend.append('image_1', image1);
      }
      if (image2) {
        formDataToSend.append('image_2', image2);
      }

      if (isEdit && slug) {
        await apiService.updateBlogPost(slug, formDataToSend);
        alert('Blog post updated successfully!');
      } else {
        await apiService.createBlogPost(formDataToSend);
        alert('Blog post created successfully!');
      }
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading blog post...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit ? 'Update your blog post content and settings' : 'Create a new blog post for your website'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter blog post title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a brief description that will appear on the blog listing"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={15}
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder={`Write your blog post content using HTML tags. Headings will be used for table of contents.

Example structure:
<h1>Main Heading</h1>
<p>Introduction paragraph...</p>

<h2>First Subheading</h2>
<p>Content for first section...</p>

<h2>Second Subheading</h2>
<p>Content for second section...</p>

Make sure to include at least 6 subheadings for proper structure.`}
              />
              <p className="mt-1 text-sm text-gray-500">
                Use HTML heading tags (h1-h6) for subheadings. They will be automatically extracted for the table of contents.
              </p>
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange('featured_image')}
                  className="w-full text-sm"
                />
                {currentImages.featured_image && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current image:</p>
                    <img 
                      src={currentImages.featured_image} 
                      alt="Current featured" 
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {/* Image 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Image 1
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange('image_1')}
                  className="w-full text-sm"
                />
                {currentImages.image_1 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current image:</p>
                    <img 
                      src={currentImages.image_1} 
                      alt="Current image 1" 
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {/* Image 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Image 2
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange('image_2')}
                  className="w-full text-sm"
                />
                {currentImages.image_2 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current image:</p>
                    <img 
                      src={currentImages.image_2} 
                      alt="Current image 2" 
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="enable_toc"
                  checked={formData.enable_toc}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Table of Contents</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Update Post' : 'Create Post'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;