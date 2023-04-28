import { render, screen } from "@testing-library/react";

import Loader from "./Loader";

describe("<Loader/>", () => {
	it("should render successfully", () => {
		render(<Loader />);
		const loaderContainer = screen.getByTestId("loader-container");
		expect(loaderContainer).toBeInTheDocument();
	});
});
