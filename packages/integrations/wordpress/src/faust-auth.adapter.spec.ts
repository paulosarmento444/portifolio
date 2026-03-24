import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@faustwp/experimental-app-router", () => ({
  getAuthClient: jest.fn(),
}));

const { getAuthClient } = jest.requireMock(
  "@faustwp/experimental-app-router",
) as {
  getAuthClient: jest.Mock;
};

const { wordpressFaustAdapter } = require("./faust-auth.adapter") as typeof import("./faust-auth.adapter");

const mockedGetAuthClient = getAuthClient as jest.Mock;

describe("wordpressFaustAdapter", () => {
  beforeEach(() => {
    mockedGetAuthClient.mockReset();
  });

  it("returns an anonymous session when Faust has no authenticated client", async () => {
    (mockedGetAuthClient as any).mockResolvedValueOnce(null);

    const session = await wordpressFaustAdapter.getSession();

    expect(session).toEqual({
      isAuthenticated: false,
      user: null,
    });
  });

  it("maps the authenticated viewer into internal auth and account summary contracts", async () => {
    const query = jest.fn(async () => ({
      data: {
        viewer: {
          id: "15",
          databaseId: 22,
          name: "Maria Silva",
          email: "maria@example.com",
          username: "maria",
          avatar: {
            url: "https://localhost:8080/avatar.jpg",
          },
          roles: {
            nodes: [{ name: "Customer" }],
          },
          posts: {
            nodes: [
              {
                id: "p-1",
                title: "Meu Post",
                uri: "/blog/meu-post/",
              },
            ],
          },
        },
      },
    }));

    (mockedGetAuthClient as any).mockResolvedValueOnce({
      query,
    } as never);

    const summary = await wordpressFaustAdapter.getViewerSummary();

    expect(query).toHaveBeenCalledTimes(1);
    expect(summary).toMatchObject({
      databaseId: 22,
      user: {
        id: "22",
        displayName: "Maria Silva",
        username: "maria",
      },
      posts: [
        {
          id: "p-1",
          title: "Meu Post",
          uri: "meu-post/",
        },
      ],
    });
    expect(summary?.user.avatar?.url).toBe("http://localhost:8080/avatar.jpg");
  });
});
