import React from "react";

import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom/extend-expect";
import IconicInfoCard from "./IconicInfoCard";

describe("IconicInfoCard", () => {
	test("renders IconicInfoCard component", () => {
		render(<IconicInfoCard title="Test Title" description="Test Description" />);

		expect(screen.getByTestId("iconic-info-card-container")).toBeInTheDocument();
		expect(screen.getByTestId("iconic-info-card-title")).toBeInTheDocument();
		expect(screen.getByTestId("iconic-info-card-description")).toBeInTheDocument();
		screen.queryByTestId("iconic-info-card-subdescription") &&
			expect(screen.getByTestId("iconic-info-card-subdescription")).toBeInTheDocument();
	});
});
