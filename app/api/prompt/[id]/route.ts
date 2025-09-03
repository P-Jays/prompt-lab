import Prompt from "@/models/prompt";
import { connectToDB } from "@/utils/database";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {
    await connectToDB();
    const prompts = await Prompt.findById(id).populate("creator");
    if (!prompts) {
      return new Response("Prompt not found!", { status: 404 });
    }

    return new Response(JSON.stringify(prompts), {
      status: 200,
    });
  } catch (error) {
    return new Response("Failed to fetch Profile", { status: 500 });
  }
};

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { prompt, tag } = await req.json();

  try {
    await connectToDB();
    const existingPrompt = await Prompt.findById(id);

    if (!existingPrompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    existingPrompt.prompt = prompt;
    existingPrompt.tag = tag;
    await existingPrompt.save();

    return new Response(JSON.stringify(existingPrompt), { status: 200 });
  } catch {
    return new Response("Failed to updated prompt", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {
    await connectToDB();
    await Prompt.findByIdAndDelete(id);

    return new Response("Prompt deleted successfully", { status: 200 });
  } catch {
    return new Response("Failed to delete prompt", { status: 500 });
  }
};
