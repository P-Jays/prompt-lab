"use client";
import { Prompt } from "@/types/types";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

export interface PromptCardProps {
  post: Prompt;
  handleTagClick?: (tag: string) => void;
  handleEdit?: (tag: string) => void;
  handleDelete?: (tag: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  post,
  handleTagClick,
  handleEdit,
  handleDelete,
}) => {
  const { data: session } = useSession();
  const pathName = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const handleCopy = () => {
    setCopied(post.prompt);
    navigator.clipboard.writeText(post.prompt);
    setTimeout(() => setCopied(""), 3000);
  };

  const handleProfileClick = () => {
    // console.log(post);
    
    if (post.creator._id === session?.user?.id) return router.push("/profile");

    router.push(`/profile/${post.creator._id}?name=${post.creator.username}`);
  };
  return (
    // <div className="prompt_card">
    //   <p className="text-sm">{post.prompt}</p>
    //   <button
    //     type="button"
    //     onClick={() => handleTagClick(post.tag)}
    //     className="mt-2 text-blue-600 hover:underline"
    //   >
    //     {post.tag}
    //   </button>
    // </div>
    <div className="prompt_card">
      <div className="flex justify-between items-start gap-5">
        <div className="flex-1 flex justify-start items-center gap-3 cursor-pointer"
        onClick={handleProfileClick}>
          <Image
            src={post.creator.image ?? "/assets/images/logo.svg"}
            alt="user_images"
            width={40}
            height={40}
            className="rounded-full object-contain"
          ></Image>
          <div className="flex flex-col">
            <h3 className="m-1 font-satoshi font-semibold text-gray-900">
              {post.creator.username}
            </h3>
            <p className="m-1 font-inter text-sm text-gray-500">
              {post.creator.email}
            </p>
          </div>
        </div>
        <div className="copy_button" onClick={handleCopy}>
          <Image
            src={
              copied === post.prompt
                ? "/assets/icons/tick.svg"
                : "/assets/icons/copy.svg"
            }
            alt="action"
            width={12}
            height={12}
          ></Image>
        </div>
      </div>
      <p className="my-4 font-satoshi text-sm text-gray-700">{post.prompt}</p>
      <p
        className="font-inter text-sm blue_gradient cursor-pointer"
        onClick={() => handleTagClick && handleTagClick(post.tag)}
      >
        #{post.tag}
      </p>
      {session?.user?.id === post.creator._id && pathName === "/profile" && (
        <div className="mt-5 flex-center gap-4 border-t border-gray-100">
          <p
            className="font-inter text-sm green_gradient cursor-pointer"
            onClick={() => handleEdit?.(post._id)}
          >
            Edit
          </p>
          <p
            className="font-inter text-sm orange_gradient cursor-pointer"
            onClick={() => handleDelete?.(post._id)}
          >
            Delete
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptCard;
