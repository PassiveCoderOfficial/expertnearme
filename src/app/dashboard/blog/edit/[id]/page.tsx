'use client';
import { use } from 'react';
import BlogPostEditor from '@/components/blog/BlogPostEditor';
export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BlogPostEditor postId={parseInt(id)} />;
}
