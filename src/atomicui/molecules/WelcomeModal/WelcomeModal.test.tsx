import { render } from "@testing-library/react";

import WelcomeModal from "./WelcomeModal";

const onClose = jest.fn();

describe("<WelcomeModal />", () => {
	it("should render successfully", () => {
		const { getByTestId } = render(<WelcomeModal open={true} onClose={onClose} />);
		expect(getByTestId("welcome-modal")).toBeInTheDocument();
	});
});
