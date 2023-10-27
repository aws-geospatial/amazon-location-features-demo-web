import { render, screen } from "@testing-library/react";

import NLLoader  from "./NLLoader";

jest.setTimeout(10000);

const nlLoadText = [
	"nl_loader_sample_text_1",
	"nl_loader_sample_text_2",
	"nl_loader_sample_text_3",
	"nl_loader_sample_text_4",
	"nl_loader_sample_text_5"
];

describe("<NLLoader/>", () => {

    beforeEach(() => {
        render(<NLLoader nlLoadText={nlLoadText}/>);
    });
    
	it("should render successfully", () => {
		const loaderContainer = screen.getByTestId("nl-loader-container");
		expect(loaderContainer).toBeInTheDocument();
	});

    it('should display the loading circle', () => {
        const nlLoader = screen.getByTestId("nl-loader");
		expect(nlLoader).toBeInTheDocument();
    });

    it('should render a message from the nlLoadText array every 3.5 seconds', async () => {

        await new Promise(resolve => setTimeout(resolve, 3500));
        const message = screen.getByTestId('nl-loader-message');
        expect(message).toHaveTextContent("nl_loader_sample_text_1");

        await new Promise(resolve => setTimeout(resolve, 3500));
        expect(message).toHaveTextContent("nl_loader_sample_text_2");
        
    });
});