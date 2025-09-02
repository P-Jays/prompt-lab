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
        return new Response('Prompt not found!', {status: 404})
    }

    return new Response(JSON.stringify(prompts), {
      status: 200,
    });
  } catch (error) {
    return new Response("Failed to fetch Profile", { status: 500 });
  }
};
