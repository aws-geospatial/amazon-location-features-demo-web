import { faker } from "@faker-js/faker";
import { render, screen } from "@testing-library/react";

import TextEl from "./TextEl";

describe("<TextEl/>", () => {
	it("should render successfully", () => {
		for (let index = 0; index < 3; index++) {
			const text = faker.random.words();
			const renderedComponent = render(<TextEl text={text} />);
			const textElement = screen.getByTestId("textEl");
			expect(textElement).toBeInTheDocument();
			expect(textElement).toHaveTextContent(text);
			renderedComponent.unmount();
		}
	});
});
