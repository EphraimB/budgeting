import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import TransferCards from "../../../components/transfers/TransfersCards";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("../../../services/actions/transfer", () => ({
  editTransfer: jest.fn(),
}));

describe("TransfersCards", () => {
  it("renders transfer cards with provided transfers and accounts", () => {
    const account_id = 1;

    render(
      <TransferCards accountId={account_id} transfers={[]} accounts={[]} />
    );

    // Assert that the FAB with the AddIcon is rendered
    expect(screen.getByTestId("AddIcon")).toBeInTheDocument();
  });
});
