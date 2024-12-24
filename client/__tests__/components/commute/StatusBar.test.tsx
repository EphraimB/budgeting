import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter, usePathname } from "next/navigation";
import StatusBar from "../../../components/commute/StatusBar";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe("StatusBar", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    pushMock.mockClear();
  });

  it("renders the title correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/123/setup");

    render(<StatusBar title="Test Title" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("disables the back button if on root setup page", () => {
    (usePathname as jest.Mock).mockReturnValue("/123/setup");

    render(<StatusBar title="Test Title" />);

    const backButton = screen.getByTestId("arrow-back-button");
    expect(backButton).toBeDisabled();
  });

  it("enables the back button if not on root setup page", () => {
    (usePathname as jest.Mock).mockReturnValue("/123/setup/step1");

    render(<StatusBar title="Test Title" />);

    const backButton = screen.getByTestId("arrow-back-button");
    expect(backButton).not.toBeDisabled();
  });

  it("navigates to the parent path when back button is clicked", () => {
    (usePathname as jest.Mock).mockReturnValue("/123/setup/step1");

    render(<StatusBar title="Test Title" />);

    const backButton = screen.getByTestId("arrow-back-button");
    fireEvent.click(backButton);

    expect(pushMock).toHaveBeenCalledWith("/123/setup");
  });

  it("navigates to commute page when close button is clicked", () => {
    (usePathname as jest.Mock).mockReturnValue("/123/setup/step1");

    render(<StatusBar title="Test Title" />);

    const closeButton = screen.getByTestId("close-button");
    fireEvent.click(closeButton);

    expect(pushMock).toHaveBeenCalledWith("/123/commute");
  });
});
