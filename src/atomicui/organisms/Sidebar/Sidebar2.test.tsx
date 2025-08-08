import { render } from "@testing-library/react";
import { I18nextProvider } from 'react-i18next';
//import i18n from './mockI18n';
import i18n from '@demo/locales/i18n';

describe('Simple Sidebar Test', () => {
    it('renders without crashing', () => {
        render(
            <I18nextProvider i18n={i18n}>
                <div>test</div>
            </I18nextProvider>
        );
    });
});

