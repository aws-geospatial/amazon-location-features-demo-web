import { render, screen, waitFor } from "@testing-library/react";

import IconicInfoCard, { IconicInfoCardProps } from "./IconicInfoCard";

const mockProps: IconicInfoCardProps = {
	IconComponent: <div></div>,
	title: "Title",
	description: "Description",
	onClickHandler: vi.fn()
};

describe("IconicInfoCard", () => {
	const renderComponent = () => {
		return render(<IconicInfoCard {...mockProps} />);
	};

	it("should render correctly", () => {
		const { getByTestId, queryByTestId } = renderComponent();
		waitFor(() => {
			expect(getByTestId("iconic-info-card-container")).toBeInTheDocument();
			expect(getByTestId("iconic-info-card-title")).toBeInTheDocument();
			expect(getByTestId("iconic-info-card-description")).toBeInTheDocument();
			queryByTestId("iconic-info-card-subdescription") &&
				expect(screen.getByTestId("iconic-info-card-subdescription")).toBeInTheDocument();
		});
	});
});
