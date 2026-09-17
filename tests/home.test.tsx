import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("presents the paid-message value proposition", () => {
  render(<HomePage />);
  expect(
    screen.getByRole("heading", { name: /messages worth opening/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /create your paiddm/i }),
  ).toHaveAttribute("href", "/login");
});

it("uses deterministic initials for the representative creator avatar", () => {
  render(<HomePage />);

  expect(screen.getByText("IA")).toHaveAttribute("aria-hidden", "true");
});
