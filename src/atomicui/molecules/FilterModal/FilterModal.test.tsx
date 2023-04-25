import { faker } from "@faker-js/faker";
import { fireEvent, render } from "@testing-library/react";

import FilterModal from "./FilterModal";

describe("<FilterModal />", () => {
	const options = [...Array(3)].map((val, idx) => ({
		key: `Category${idx}`,
		title: `Category${idx}`,
		options: [...Array(3)].map((val, idx) => ({
			label: `Option${idx}`,
			value: `Option${idx}`
		}))
	}));
	const values = {
		Category0: [],
		Category1: [],
		Category2: []
	};
	const onClose = jest.fn();
	const onChange = jest.fn();

	it("should not render when isOpen is false", () => {
		const { queryByTestId } = render(
			<FilterModal
				isOpen={false}
				title={faker.datatype.string()}
				options={options}
				values={values}
				onClose={onClose}
				onChange={onChange}
			/>
		);
		expect(queryByTestId("filter-modal-container")).not.toBeInTheDocument();
	});

	it("should render successfully when isOpen is true", () => {
		const { getByTestId } = render(
			<FilterModal
				isOpen={true}
				title={faker.datatype.string()}
				options={options}
				values={values}
				onClose={onClose}
				onChange={onChange}
			/>
		);
		expect(getByTestId("filter-modal-container")).toBeInTheDocument();
	});

	it("should update filters once new filters are applied", () => {
		const { getByText, getByTestId } = render(
			<FilterModal
				isOpen={true}
				title={faker.datatype.string()}
				options={options}
				values={values}
				onClose={onClose}
				onChange={onChange}
			/>
		);
		fireEvent.click(getByTestId("category-0"));
		fireEvent.click(getByTestId("option-0"));
		fireEvent.click(getByText("APPLY"));
		fireEvent.click(getByText("DONE"));
		expect(getByTestId("counter-badge-0")).toHaveTextContent("1");
	});

	it("should toggle checkmark if already selected filter is clicked", () => {
		const { getByText, getByTestId, queryByTestId } = render(
			<FilterModal
				isOpen={true}
				title={faker.datatype.string()}
				options={options}
				values={values}
				onClose={onClose}
				onChange={onChange}
			/>
		);
		fireEvent.click(getByTestId("category-0"));
		fireEvent.click(getByTestId("option-0"));
		fireEvent.click(getByTestId("option-0"));
		fireEvent.click(getByText("APPLY"));
		fireEvent.click(getByText("DONE"));
		expect(queryByTestId("counter-badge-0")).not.toBeInTheDocument();
	});
});
