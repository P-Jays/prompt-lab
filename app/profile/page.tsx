"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProfileComponent from "@/components/ProfileComponent";

const Profile = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`/api/users/${session?.user?.id}/posts`);
      const data = await response.json();
      // console.log(data);

      setPosts(data);
    };
    if (session?.user?.id) {
      fetchPosts();
    }
  }, []);
  const handleDelete = async () => {};
  const handleEdit = async () => {};
  return (
    <ProfileComponent
      name="My"
      desc="Welcome to personalized profile pages"
      data={posts}
      handleEdit={() => {}}
      handleDelete={() => {}}
    ></ProfileComponent>
  );
};

export default Profile;
