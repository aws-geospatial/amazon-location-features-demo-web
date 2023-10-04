import i18n from "@demo/locales/i18n";
import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";

import DropdownEl, { DropdownElProps } from "./DropdownEl";

const defaultDropdownElProps: DropdownElProps = {
	defaultOption: undefined,
	options: [
		{ value: "option1", label: "Option 1" },
		{ value: "option2", label: "Option 2" },
		{ value: "option3", label: "Option 3" }
	],
	onSelect: jest.fn(),
	showSelected: false,
	bordered: false,
	isCheckbox: false,
	isRadioBox: false,
	arrowIconColor: "blue",
	label: undefined
};

describe("<DropdownEl />", () => {
	const props: DropdownElProps = {
		...defaultDropdownElProps,
		options: [...defaultDropdownElProps.options]
	};
	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<DropdownEl {...props} />
			</I18nextProvider>
		);

	beforeEach(() => {
		props.defaultOption = undefined;
		props.options = [...defaultDropdownElProps.options];
		props.onSelect = defaultDropdownElProps.onSelect;
		props.showSelected = defaultDropdownElProps.showSelected;
		props.bordered = defaultDropdownElProps.bordered;
		props.isCheckbox = defaultDropdownElProps.isCheckbox;
		props.isRadioBox = defaultDropdownElProps.isRadioBox;
		props.arrowIconColor = defaultDropdownElProps.arrowIconColor;
		props.label = defaultDropdownElProps.label;
	});

	it("should render correctly with label if provided", () => {
		props.label = "Test Label";
		const { getByTestId } = renderComponent();
		expect(getByTestId("dropdown-label")).toHaveTextContent(props.label as string);
	});

	it("should render correctly with default option label if label is empty", () => {
		props.defaultOption = { ...props.options[0] };
		const { getByTestId } = renderComponent();
		expect(getByTestId("dropdown-label")).toHaveTextContent(props.defaultOption.label);
	});

	it("should render correctly with placeholder text if neither label nor default option present", () => {
		const { getByTestId } = renderComponent();
		expect(getByTestId("dropdown-label")).toHaveTextContent("Select an option");
	});

	it("should open the dropdown when clicked and close when clicked outside", () => {
		const { getByTestId, queryByTestId } = renderComponent();
		fireEvent.click(getByTestId("dropdown-trigger"));
		expect(getByTestId("dropdown-options")).toBeInTheDocument();
		fireEvent.mouseDown(document);
		expect(queryByTestId("dropdown-options")).not.toBeInTheDocument();
	});

	it("should invoke the onSelect function when an option is clicked", () => {
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("dropdown-trigger"));
		fireEvent.click(getByTestId("option2"));
		expect(props.onSelect).toBeCalledWith(props.options[1]);
	});

	it("should show radio button in dropdown if isRadioBox prop is set to true", () => {
		props.isRadioBox = true;
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("dropdown-trigger"));
		expect(getByTestId(`radiobox-${props.options[0].value}`)).toBeInTheDocument();
		expect(getByTestId(`radiobox-${props.options[1].value}`)).toBeInTheDocument();
		expect(getByTestId(`radiobox-${props.options[2].value}`)).toBeInTheDocument();
		fireEvent.click(getByTestId(`radiobox-${props.options[2].value}`).children[1].children[0].children[1]);
		expect(props.onSelect).toBeCalledWith(props.options[2]);
	});

	it("should show checkbox in dropdown if isCheckbox prop is set to true", () => {
		props.bordered = true;
		props.showSelected = true;
		props.isCheckbox = true;
		props.defaultOption = [{ ...props.options[0] }];
		const { getByTestId } = renderComponent();
		fireEvent.click(getByTestId("dropdown-trigger"));
		expect(getByTestId(`checkbox-${props.options[0].value}`)).toBeInTheDocument();
		expect(getByTestId(`checkbox-${props.options[1].value}`)).toBeInTheDocument();
		expect(getByTestId(`checkbox-${props.options[2].value}`)).toBeInTheDocument();
		fireEvent.click(getByTestId(`checkbox-${props.options[2].value}`));
		expect(props.onSelect).toBeCalledWith(props.options[2]);
	});
});
