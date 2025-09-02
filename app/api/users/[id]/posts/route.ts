import Prompt from "@/models/prompt";
import { connectToDB } from "@/utils/database";

// type RouteContext<T extends string = string> = {
//   params: Record<T, string>;
// }; { params }: RouteContext<"id">

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {
    await connectToDB();
    const prompts = await Prompt.find({
      creator: id,
    }).populate("creator");

    return new Response(JSON.stringify(prompts), {
      status: 200,
    });
  } catch (error) {
    return new Response("Failed to fetch Profile", { status: 500 });
  }
};
