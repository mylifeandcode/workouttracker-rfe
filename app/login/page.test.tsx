import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

// Mock the router the component pulls from next/navigation. `vi.hoisted` lets the
// spies exist before vi.mock is hoisted above the imports.
const { replace, refresh } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

describe("LoginPage", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  async function fillAndSubmit(username: string, password: string) {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByPlaceholderText("username"), username);
    await user.type(screen.getByPlaceholderText("Password"), password);
    await user.click(screen.getByRole("button", { name: /login/i }));
  }

  it("posts credentials to the BFF and redirects on success", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await fillAndSubmit("alice", "pw");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "alice", password: "pw" }),
      }),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("shows an error and does not redirect when credentials are rejected", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await fillAndSubmit("bob", "bad");

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
