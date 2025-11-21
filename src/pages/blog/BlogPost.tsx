// import React from 'react';
// import { Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
// import { blogPosts } from './blogPosts';

// interface BlogPostProps {
//   postId: string;
// }

// const BlogPost: React.FC<BlogPostProps> = ({ postId }) => {
//   const post = blogPosts.find(p => p.id === postId);

//   if (!post) {
//     return (
//       <div className="min-h-screen bg-white">
//         <div className="container mx-auto px-4 py-16">
//           <p className="text-center text-gray-500">Blog post not found.</p>
//         </div>
//       </div>
//     );
//   }

//   const renderTableOfContents = () => {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
//         <div className="flex items-start justify-between mb-4">
//           <h3 className="text-lg font-bold text-gray-900">Table of Contents</h3>
//           <button className="text-gray-500 hover:text-gray-700">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           </button>
//         </div>
//         <ul className="space-y-2">
//           {post.content.sections.map((section, index) => (
//             <li key={index}>
//               <a href={`#section-${index}`} className="text-blue-500 hover:text-blue-600 text-sm">
//                 {section.title}
//               </a>
//               {section.subsections && section.subsections.length > 0 && (
//                 <ul className="ml-4 mt-1 space-y-1">
//                   {section.subsections.map((subsection, subIndex) => (
//                     <li key={subIndex}>
//                       <a href={`#subsection-${index}-${subIndex}`} className="text-blue-400 hover:text-blue-500 text-sm">
//                         {subsection.title}
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="bg-blue-500 py-16">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl">
//             <div className="mb-4">
//               <span className="inline-flex items-center text-white text-sm">
//                 <span className="mr-2">🏷️</span>
//                 {post.category}
//               </span>
//             </div>
//             <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
//               {post.title}
//             </h1>
//             <div className="w-24 h-1 bg-red-500 mb-6"></div>
//             <div className="flex items-center text-white text-sm">
//               <span className="mr-4">{post.date}</span>
//               <span className="mr-1">/</span>
//               <span className="ml-4">by {post.author}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-12">
//         <div className="max-w-4xl mx-auto">
//           <img
//             src={post.imageUrl}
//             alt={post.title}
//             className="w-full h-96 object-cover rounded-lg mb-12"
//           />

//           {renderTableOfContents()}

//           <div className="prose prose-lg max-w-none">
//             <p className="text-gray-700 text-lg leading-relaxed mb-8">
//               {post.content.introduction}
//             </p>

//             {post.content.sections.map((section, index) => (
//               <div key={index} id={`section-${index}`} className="mb-10">
//                 <h2 className="text-3xl font-bold text-gray-900 mb-4">
//                   {section.title}
//                 </h2>

//                 <p className="text-gray-700 text-base leading-relaxed mb-6">
//                   {section.content}
//                 </p>

//                 {section.subsections && section.subsections.map((subsection, subIndex) => (
//                   <div key={subIndex} id={`subsection-${index}-${subIndex}`} className="mb-6">
//                     {subsection.title && (
//                       <h3 className="text-xl font-bold text-gray-900 mb-3">
//                         {subsection.title}
//                       </h3>
//                     )}

//                     {subsection.content && (
//                       <p className="text-gray-700 text-base leading-relaxed mb-4">
//                         {subsection.content}
//                       </p>
//                     )}

//                     {subsection.items && subsection.items.length > 0 && (
//                       <ul className="list-disc list-inside space-y-3 ml-4">
//                         {subsection.items.map((item, itemIndex) => (
//                           <li key={itemIndex} className="text-gray-700 text-base leading-relaxed">
//                             {item}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center justify-end gap-4 mt-12 pt-8 border-t border-gray-200">
//             <button
//               className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
//               aria-label="Share on Facebook"
//             >
//               <Facebook className="w-5 h-5" />
//             </button>
//             <button
//               className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-400 hover:bg-blue-500 text-white transition-colors"
//               aria-label="Share on Twitter"
//             >
//               <Twitter className="w-5 h-5" />
//             </button>
//             <button
//               className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors"
//               aria-label="Share on LinkedIn"
//             >
//               <Linkedin className="w-5 h-5" />
//             </button>
//             <button
//               className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
//               aria-label="Share"
//             >
//               <Share2 className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogPost;
