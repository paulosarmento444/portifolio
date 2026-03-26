import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import { SiteToaster } from "./site-toaster.component";

describe("SiteToaster", () => {
  it("mounts the shared toast provider with the storefront position", () => {
    render(<SiteToaster />);

    const toasterRoot = document.querySelector("[data-rht-toaster]");

    expect(toasterRoot).not.toBeNull();
    expect(toasterRoot?.getAttribute("style")).toContain("bottom: 16px");
  });
});
