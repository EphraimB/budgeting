import React from "react";
import { render } from "@testing-library/react";
import JobDayTimeslots from "../../components/JobDayTimeslots";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

describe("JobDayTimeslots", () => {
  const initialJobSchedule = [
    { job_id: 1, day_of_week: 1, start_time: "09:00:00", end_time: "10:00:00" },
    { job_id: 1, day_of_week: 2, start_time: "11:00:00", end_time: "12:00:00" },
  ];

  it("renders initial timeslots based on job_schedule prop", () => {
    const { getAllByLabelText } = render(
      <JobDayTimeslots
        job_schedule={initialJobSchedule}
        onSave={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const startTimes = getAllByLabelText("Start Time");
    const endTimes = getAllByLabelText("End Time");

    expect(startTimes[0]).toHaveValue("09:00 AM");
    expect(endTimes[0]).toHaveValue("10:00 AM");
    expect(startTimes[1]).toHaveValue("11:00 AM");
    expect(endTimes[1]).toHaveValue("12:00 PM");
  });

  it("adds a new timeslot", async () => {
    const { getByText, getAllByLabelText } = render(
      <JobDayTimeslots
        job_schedule={initialJobSchedule}
        onSave={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await userEvent.click(getByText("Add Timeslot"));

    const startTimes = getAllByLabelText("Start Time");
    const endTimes = getAllByLabelText("End Time");

    expect(startTimes.length).toBe(3); // One more than initially
    expect(endTimes.length).toBe(3); // One more than initially
  });

  it("removes a timeslot", async () => {
    const { getAllByRole, getAllByLabelText } = render(
      <JobDayTimeslots
        job_schedule={initialJobSchedule}
        onSave={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const deleteButtons = getAllByRole("button", { name: "delete" });

    await userEvent.click(deleteButtons[0]); // Remove the first timeslot

    const startTimes = getAllByLabelText("Start Time");
    expect(startTimes.length).toBe(1); // Only one timeslot should remain
  });

  it("handles time changes correctly", async () => {
    const { getAllByLabelText } = render(
      <JobDayTimeslots
        job_schedule={initialJobSchedule}
        onSave={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const startTimes = getAllByLabelText("Start Time");

    await userEvent.type(startTimes[0], "08:00 AM");

    expect(startTimes[0]).toHaveValue("08:00 AM"); // Start time of the first timeslot should be updated
  });

  it("invokes onSave with updated timeslots on save", async () => {
    const onSaveMock = jest.fn();
    const { getByText, getAllByLabelText } = render(
      <JobDayTimeslots
        job_schedule={initialJobSchedule}
        onSave={onSaveMock}
        onClose={jest.fn()}
      />
    );

    // Change a time to trigger an update
    const startTimes = getAllByLabelText("Start Time");
    // fireEvent.change(startTimes[0], { target: { value: "08:00:00" } });
    await userEvent.type(startTimes[0], "08:00:00");

    // Click the save button
    await userEvent.click(getByText("Save"));

    // Expect onSave to have been called with the updated timeslots
    expect(onSaveMock).toHaveBeenCalledWith([
      { startTime: "08:00:00", endTime: "10:00:00" }, // Updated timeslot
      { startTime: "11:00:00", endTime: "12:00:00" }, // Unchanged timeslot
    ]);
  });
});
