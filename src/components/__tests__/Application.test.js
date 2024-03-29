import React from "react";
import axios from "axios";

import { render, 
  cleanup, 
  fireEvent, 
  getByText, 
  findByText, 
  findAllByAltText,
  prettyDOM, 
  getAllByTestId, 
  getByAltText, 
  getByPlaceholderText, 
  queryByText
} from "@testing-library/react";

import Application from "components/Application";


describe ("Application", () => {
  afterEach(cleanup);
  it("defaults to Monday and changes the schedule when a new day is selected", async () => {
    const { queryByText, findByText } = render(<Application />);
  
    await findByText("Monday");
  
      fireEvent.click(queryByText("Tuesday"));
      expect(queryByText("Leopold Silvers")).toBeInTheDocument();
  });
  
  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    const { container } = render(<Application />);
  
    await findByText(container, "Archie Cohen");
  
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
  
    fireEvent.click(getByAltText(appointment, "Add"));
  
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
  
    fireEvent.click(getByText(appointment, "Save"));

    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await findByText(appointment, "Lydia Miller-Jones");
    const day = getAllByTestId(container, "day").find((day) => queryByText(day, "Monday"));

    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application.
    const { container, debug } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");
    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find((appointment) =>
    queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(getByAltText(appointment, "Delete"));
    // 4. Check that the confirmation message is shown.
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();
    // 5. Click the "Confirm" button on the confirmation.
    fireEvent.click(getByText(appointment, "Confirm"));
    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    // 7. Wait until the element with the "Add" button is displayed.
    await findAllByAltText(container, "Add");
    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    const day = getAllByTestId(container, "day").find((day) => queryByText(day, "Monday"));
    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    const { container, debug } = render(<Application />);
    await findByText(container, "Archie Cohen");

    const appointment = getAllByTestId(container, "appointment").find((appointment) =>
    queryByText(appointment, "Archie Cohen")
    );
    fireEvent.click(getByAltText(appointment, "Edit"));

    expect(getByText(appointment, "Save")).toBeInTheDocument();

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Vinny Paws" },
    });
    fireEvent.click(getByAltText(appointment, "Tori Malcolm"));

    fireEvent.click(getByText(appointment, "Save"));
    
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await findByText(container, "Vinny Paws");
    const day = getAllByTestId(container, "day").find((day) => queryByText(day, "Monday"));

    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
    expect(getByText(appointment, "Tori Malcolm")).toBeInTheDocument();
  });
  
  it("shows the save error when failing to save an appointment", async() => {
    axios.put.mockRejectedValueOnce(new Error("Could not book appointment."));

    const { container } = render(<Application />);
  
    await findByText(container, "Archie Cohen");
  
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
  
    fireEvent.click(getByAltText(appointment, "Add"));
  
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
  
    fireEvent.click(getByText(appointment, "Save"));

    await findByText(container, "Could not book appointment.");

    expect(getByText(container, "Could not book appointment.")).toBeInTheDocument();
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {

    axios.delete.mockRejectedValueOnce(new Error("Could not cancel appointment."));

    const { container } = render(<Application />);
  
    await findByText(container, "Archie Cohen");
  
    const appointment = getAllByTestId(container, "appointment").find((appointment) =>
    queryByText(appointment, "Archie Cohen")
    );
  
    fireEvent.click(getByAltText(appointment, "Delete"));
    
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();
    
    fireEvent.click(getByText(appointment, "Confirm"));

    await findByText(container, "Could not cancel appointment.");

    expect(getByText(container, "Could not cancel appointment.")).toBeInTheDocument();
  });
});

