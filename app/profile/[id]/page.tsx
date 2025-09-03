"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import ProfileComponent from "@/components/ProfileComponent";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const userName = searchParams.get("name");

  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`/api/users/${id}/posts`);
      const data = await response.json();
    //   console.log(data);

      setUserPosts(data);
    };

    if (id) fetchPosts();
  }, [id]);

  return (
    <ProfileComponent
      name={userName ?? ""}
      desc={`Welcome to ${userName}'s personalized profile page. Explore ${userName}'s exceptional prompts and be inspired by the power of their imagination`}
      data={userPosts}
    ></ProfileComponent>
  );
};

export default UserProfile;
