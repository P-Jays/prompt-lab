/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Mock DB connector to avoid real connections during tests
vi.mock("@/utils/database", () => ({ connectToDB: vi.fn().mockResolvedValue(undefined) }));

// Mock service layer used by callbacks
vi.mock("@/lib/userService", () => ({
  ensureUserWithImage: vi.fn(),
  findUserIdAndImageByEmail: vi.fn(),
}));

import { ensureUserWithImage, findUserIdAndImageByEmail } from "@/lib/userService";

describe("NextAuth callbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signIn creates user (and backfills) without throwing", async () => {
    (ensureUserWithImage as any).mockResolvedValue({ created: true, backfilled: false });

    const out = await authOptions.callbacks!.signIn!({
      user: null as any,
      account: null as any,
      profile: { email: "a@b.com", name: "Alice", picture: "https://img" } as any,
      credentials: {},
    });

    expect(out).toBe(true);
    expect(ensureUserWithImage).toHaveBeenCalledWith({
      email: "a@b.com",
      name: "Alice",
      image: "https://img",
    });
  });

  it("jwt injects userId and picture when user exists", async () => {
    (findUserIdAndImageByEmail as any).mockResolvedValue({
      _id: { toString: () => "abc123" },
      image: "https://img",
    });

    const tokenIn: any = { email: "a@b.com" };
    const tokenOut = await authOptions.callbacks!.jwt!({
      token: tokenIn,
      account: null,
      profile: null as any,
      user: null as any,
      trigger: "update",
      session: null as any,
    });

    expect(tokenOut.userId).toBe("abc123");
    expect(tokenOut.picture).toBe("https://img");
  });

  it("session exposes id and image to client", async () => {
    const sessionIn: any = { user: { name: "Alice" } };
    const token: any = { userId: "abc123", picture: "https://img" };

    const sessionOut = await authOptions.callbacks!.session!({
      session: sessionIn,
      token,
      user: null as any,
      newSession: null as any,
      trigger: "update",
    });

    expect(sessionOut?.user?.name).toBe("abc123"); //id
    expect(sessionOut?.user?.image).toBe("https://img");
  });

  it("signIn returns false if email is missing", async () => {
    const out = await authOptions.callbacks!.signIn!({
      user: null as any,
      account: null as any,
      profile: { name: "NoEmailUser" } as any,
      credentials: {},
    });
    expect(out).toBe(false);
    expect(ensureUserWithImage).not.toHaveBeenCalled();
  });
});
