import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { SiteLogo } from "./site-logo.component";

describe("SiteLogo", () => {
  it("renders the brand image with the storefront label", () => {
    render(<SiteLogo />);

    expect(screen.getByAltText("Solar Esportes")).toBeTruthy();
  });
});
