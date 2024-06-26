import React from "react";
import { render, screen } from "@testing-library/react";
import JobActionsMenu from "../../../components/jobs/JobActionsMenu";
import "@testing-library/jest-dom";

describe("JobActionsMenu", () => {
  const setJobModes = jest.fn();

  it("renders", () => {
    render(
      <JobActionsMenu
        anchorEl={null}
        open={true}
        handleClose={() => {}}
        setJobModes={setJobModes}
        job_id={1}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
