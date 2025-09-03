/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProfileComponent from "@/components/ProfileComponent";
import { Prompt } from "@/types/types";

const Profile = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`/api/users/${session?.user?.id}/posts`);
      if (!response.ok) return;
      const data = await response.json();
      // console.log(data);

      setPosts(data);
    };
    if (session?.user?.id) {
      fetchPosts();
    }
  }, [session?.user?.id]);
  //   const handleDelete = async (post: any) => {
  //     const hasConfirmed = confirm("Are you sure want to delete this prompt?");
  //     console.log(post);
  //     console.log(posts);

  //     if (!hasConfirmed) {
  //         try {
  //             await fetch(`/api/prompt/${post._id}`, {
  //                 method: 'DELETE',
  //             })

  //         console.log(post);

  //         const filteredPosts = posts.filter((p: Prompt)=> p._id !== post._id);
  //         setPosts(filteredPosts);
  //         } catch (error) {
  //             console.log(error);
  //         }
  //     }

  //   };
  const handleDelete = async (id: string) => {
    const hasConfirmed = confirm(
      "Are you sure you want to delete this prompt?"
    );
    if (!hasConfirmed) return;

    try {
      const res = await fetch(`/api/prompt/${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("Delete failed", await res.text());
        return;
      }
      setPosts((prev) => prev.filter((p: Prompt) => p._id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleEdit = async (_id: any) => {
    console.log("edit", _id);

    router.push(`/update-prompt?id=${_id}`);
  };
  return (
    <ProfileComponent
      name="My"
      desc="Welcome to personalized profile pages"
      data={posts}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    ></ProfileComponent>
  );
};

export default Profile;
