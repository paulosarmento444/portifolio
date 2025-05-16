"use client";

import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { apolloClient } from "@/app/lib/apolloClient";
import Header from "@/app/components/Header";
import Image from "next/image";

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

const GET_POST = gql`
  query GetPost($uri: String!) {
    postBy(uri: $uri) {
      title
      content
      uri
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
`;

export default function PostPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const uri = window.location.pathname.replace("/", "");
        const { data } = await apolloClient.query({
          query: GET_POST,
          variables: { uri },
        });
        setPost(data.postBy);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  return (
    <>
      <Header />
      <main className="relative overflow-y-scroll p-8 pb-20 scrollbar-hide lg:px-16 mt-20">
        <div className="container max-w-4xl mx-auto">
          {loading ? (
            <p className="text-center">Carregando...</p>
          ) : post ? (
            <article className="prose lg:prose-xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              {post.featuredImage?.node?.sourceUrl && (
                <div className="mb-8">
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.title}
                    width={1200}
                    height={600}
                    className="w-full h-auto rounded-lg"
                    unoptimized
                  />
                </div>
              )}
              <div
                className="prose prose-lg text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          ) : (
            <p className="text-center">Post não encontrado</p>
          )}
        </div>
      </main>
    </>
  );
}
