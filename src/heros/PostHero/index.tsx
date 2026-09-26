import React from 'react'
import type { Post } from '@/payload-types'
import { PostHeader } from '@/components/PostHeader'

export const PostHero: React.FC<{
  post: Post
  readingTime?: number
}> = ({ post, readingTime }) => {
  return <PostHeader post={post} readingTime={readingTime} />
}
