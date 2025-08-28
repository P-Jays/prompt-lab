"use client";

import { Dispatch, SetStateAction, FormEvent } from "react";
import Link from "next/link";

type Post = { prompt: string; tag: string };

export type FormProps = {
  type: "Create" | "Edit"; // or string
  post: Post;
  setPost: Dispatch<SetStateAction<Post>>;
  submitting: boolean;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export default function Form({
  type,
  post,
  setPost,
  submitting,
  handleSubmit,
}: FormProps) {
  return (
    <section className="w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="blue_gradient">{type} Post</span>
      </h1>
      <p className="desc text-left max-w-md">
        share amazing prompts with the world, and let our imagination run wild
        with any AI-powered platform.
      </p>
      {/* <form
        onSubmit={handleSubmit}
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
      >
        <label className="font-satoshi font-semibold text-base text-gray-700">
          <span>Your AI Prompts</span>
          <textarea id="prompts"
          name="prompts"
            value={post.prompt}
            onChange={(e) => setPost({ ...post, prompt: e.target.value })}
            placeholder="write ur prompt here."
            required
            className="form_textarea resize-y sm:resize"
          ></textarea>
        </label>
      </form> */}
      <form
        onSubmit={handleSubmit}
        className="mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism"
        aria-labelledby="prompt-label"
        noValidate
      >
        <label
          id="prompt-label"
          htmlFor="prompts"
          className="font-satoshi font-semibold text-gray-800"
        >
          Your AI Prompts
        </label>

        <textarea
          id="prompts"
          name="prompts"
          value={post.prompt}
          onChange={(e) => setPost({ ...post, prompt: e.target.value })}
          placeholder="Write your prompt here…"
          required
          spellCheck={false}
          autoCorrect="off"
          autoComplete="off"
          className="
          max-w-full
          min-h-[clamp(8rem,24vh,18rem)]
          rounded-lg border border-gray-300 bg-white p-3
          text-sm text-gray-800 outline-none
          shadow-sm focus:border-black focus:ring-0
          resize-y sm:resize
        "
          aria-describedby="prompt-help"
        />

        <p id="prompt-help" className="text-xs text-gray-500">
          Tip: Describe the goal, constraints, and examples for better results.
        </p>

        <label
          id="tag-label"
          htmlFor="tags"
          className="font-satoshi font-semibold text-gray-800"
        >
          Tags{" "}
          <span className="font-normal">(#product, #webdesign, #anything)</span>
        </label>

        <input
          id="tags"
          value={post.tag}
          onChange={(e) => setPost({ ...post, tag: e.target.value })}
          placeholder="#tag"
          required
          className="max-w-full
          rounded-lg border border-gray-300 bg-white p-3
          text-sm text-gray-800 outline-none
          shadow-sm focus:border-black focus:ring-0"
        />

        <div className="flex-end mx-3 mb-5 gap-4">
          <Link href={"/"} className="text-gray-500 text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full px-5 py-2 text-sm text-white bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? `${type}...` : type}
          </button>
        </div>
      </form>
    </section>
  );
}
