import { CommuteHistory } from "@/app/types/types";
import CommuteHistoryTable from "../../../components/commuteHistory/CommuteHistoryTable";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("CommuteHistoryTable Component", () => {
  const commuteHistory: CommuteHistory[] = [
    {
      id: 1,
      accountId: 1,
      commuteSystem: "OMNY",
      fareType: "Regular",
      fare: 2.9,
      timestamp: "2024-12-24T15:37:58.134Z",
      dateCreated: "2020-01-01",
      dateModified: "2020-01-01",
    },
  ];

  it("should render the commute history table", () => {
    render(<CommuteHistoryTable commuteHistory={commuteHistory} />);

    // Use getByRole to find the table cell and match the content
    const cell = screen.getByRole("cell", {
      name: /Tuesday.*December 24, 2024.*10:37 AM/i, // Matches the full string content
    });

    expect(screen.getByText("Commute system")).toBeInTheDocument();
    expect(screen.getByText("Fare type")).toBeInTheDocument();
    expect(screen.getByText("Fare")).toBeInTheDocument();
    expect(screen.getByText("Purchased")).toBeInTheDocument();

    expect(screen.getByText("OMNY")).toBeInTheDocument();
    expect(screen.getByText("Regular")).toBeInTheDocument();
    expect(screen.getByText("$2.90")).toBeInTheDocument();

    // Assert the cell has the correct content
    expect(cell).toHaveTextContent("Tuesday");
    expect(cell).toHaveTextContent("December 24, 2024");
    expect(cell).toHaveTextContent("10:37 AM");
  });
});
