"use client";

import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "../lib/apolloClient";
import Header from "../components/Header";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpAnimation } from "../lib/animations";

interface Post {
  title: string;
  content: string;
  uri: string;
  featuredImage: {
    node: {
      sourceUrl: string;
    };
  };
}

const GET_POSTS = gql`
  query GetAllPosts {
    posts {
      nodes {
        title
        uri
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await apolloClient.query({ query: GET_POSTS });
        const postsData = data?.posts?.nodes || [];
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts.");
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Header />
      <main className="relative overflow-y-scroll p-8 pb-20 scrollbar-hide lg:px-16 mt-20">
        <div className="container py-32 grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-x-4 gap-y-6">
          {error ? (
            <p>{error}</p>
          ) : posts.length > 0 ? (
            posts.map((post, i) => (
              <motion.div
                key={i}
                {...fadeUpAnimation}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={post.uri}>
                  <PostCard post={post} />
                </Link>
              </motion.div>
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>
      </main>
    </>
  );
}

type PostCardProps = {
  post: Post;
};

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="rounded-lg h-[436px] flex flex-col bg-gray-800 overflow-hidden group transition-all border-2 border-gray-800 hover:border-lime-300 opacity-70 hover:opacity-100">
      <div className="w-full h-48 overflow-hidden">
        <Image
          width={380}
          height={200}
          className="w-full h-full object-cover group-hover:scale-110 duration-500 transition-all"
          alt={`Thumbnail for post ${post.title}`}
          src={post.featuredImage.node.sourceUrl}
          unoptimized
        />
      </div>

      <div className="flex-1 flex flex-col p-8">
        <strong className="font-medium text-gray-50/90 group-hover:text-lime-300 transition-all">
          {post.title}
        </strong>
      </div>
    </div>
  );
};
