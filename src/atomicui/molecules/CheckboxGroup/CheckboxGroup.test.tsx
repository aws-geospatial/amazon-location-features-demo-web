import { faker } from "@faker-js/faker";
import { RenderResult, act, render, screen } from "@testing-library/react";

import CheckboxGroup from "./CheckboxGroup";

describe("<CheckboxGroup/>", () => {
	const values = [...Array(3)].map(() => faker.random.word());
	let onChange = jest.fn();
	let checkboxGroupContainer: HTMLElement;
	let checkboxGroupCheckboxField: HTMLElement[];

	/* eslint-disable  @typescript-eslint/no-explicit-any */
	const renderComponent = (CheckboxGroupProps?: any): RenderResult => {
		onChange = jest.fn();
		const options = values.map(val => ({ label: val, value: val }));
		const renderedComponent = render(
			<CheckboxGroup title="checkbox title" onChange={onChange} options={options} values={[]} {...CheckboxGroupProps} />
		);
		checkboxGroupContainer = screen.getByTestId("checkbox-group-container");
		checkboxGroupCheckboxField = screen.getAllByTestId("checkbox-group-checkbox-field");
		return renderedComponent;
	};

	it("should render successfully", () => {
		renderComponent();

		expect(checkboxGroupContainer).toBeInTheDocument();
	});

	it("should triggger the given onChange function if a something is selected", () => {
		renderComponent();

		// clicked a random option
		act(() => checkboxGroupCheckboxField[Math.floor(Math.random() * values.length)].click());
		expect(onChange).toBeCalled();

		// click one more time
		act(() => checkboxGroupCheckboxField[Math.floor(Math.random() * values.length)].click());
		expect(onChange).toBeCalledTimes(2);
	});

	it("should mark the checkbox checked as per the provided values", () => {
		const randomCheckboxIndex = Math.floor(Math.random() * values.length);
		renderComponent({ values: [values[randomCheckboxIndex]] });

		for (let index = 0; index < checkboxGroupCheckboxField.length; index++) {
			if (randomCheckboxIndex === index) {
				expect(checkboxGroupCheckboxField[index]).toBeChecked();
			} else {
				expect(checkboxGroupCheckboxField[index]).not.toBeChecked();
			}
		}
	});

	it("should mark checkboxes checked/unchecked", () => {
		const randomCheckboxIndex = Math.floor(Math.random() * values.length);

		let selectedValues: string[] = [];

		const onChange = jest.fn((changedValues: string[]) => {
			if (selectedValues.includes(values[randomCheckboxIndex])) {
				expect(changedValues).not.toContain(values[randomCheckboxIndex]);
			} else {
				expect(changedValues).toContain(values[randomCheckboxIndex]);
			}
			selectedValues = changedValues;
		});

		const renderedCheckboxGroup = renderComponent({ onChange });

		act(() => checkboxGroupCheckboxField[randomCheckboxIndex].click());

		expect(selectedValues).toContain(values[randomCheckboxIndex]);

		// re-render with the selected values (mimicking the actual scenario)
		renderedCheckboxGroup.unmount();
		renderComponent({ values: selectedValues, onChange });

		act(() => checkboxGroupCheckboxField[randomCheckboxIndex].click());
	});
});
