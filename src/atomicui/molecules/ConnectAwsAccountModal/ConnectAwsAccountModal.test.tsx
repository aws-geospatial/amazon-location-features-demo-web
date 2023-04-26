import { faker } from "@faker-js/faker";
import { fireEvent, render } from "@testing-library/react";

import ConnectAwsAccountModal from "./ConnectAwsAccountModal";

describe("<ConnectAwsAccountModal />", () => {
	it("should not render when open is false", () => {
		const { queryByTestId } = render(<ConnectAwsAccountModal open={false} onClose={jest.fn()} />);
		expect(queryByTestId("connect-aws-account-modal-container")).not.toBeInTheDocument();
	});

	it("should render successfully when open is true", () => {
		const { getByTestId } = render(<ConnectAwsAccountModal open={true} onClose={jest.fn()} />);
		expect(getByTestId("connect-aws-account-modal-container")).toBeInTheDocument();
	});

	it("should show connect button as disabled when no values are present", () => {
		const { getByTestId } = render(<ConnectAwsAccountModal open={true} onClose={jest.fn()} />);
		expect(getByTestId("connect-button")).toBeDisabled();
	});

	it("should show connect button as enabled when all values are present", () => {
		const { getByTestId } = render(<ConnectAwsAccountModal open={true} onClose={jest.fn()} />);
		for (let i = 0; i < 5; i++) {
			fireEvent.change(getByTestId(`input-field-${i}`), { target: { value: faker.datatype.string() } });
		}
		expect(getByTestId("connect-button")).toBeEnabled();
	});
});
