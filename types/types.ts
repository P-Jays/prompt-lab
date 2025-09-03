export type Prompt = {
  _id: string;
  prompt: string;
  tag: string;
  creator: { username: string; image?: string, email: string, _id: string, displayName?: string } 
};