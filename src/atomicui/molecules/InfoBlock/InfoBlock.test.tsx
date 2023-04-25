import { faker } from "@faker-js/faker";
import { render } from "@testing-library/react";

import InfoBlock from "./InfoBlock";

describe("<InfoBlock />", () => {
	it("should render successfully given a text and body", () => {
		const { getByTestId } = render(<InfoBlock title={faker.datatype.string()} body={faker.datatype.string()} />);
		expect(getByTestId("info-block-container")).toBeInTheDocument();
	});
});
