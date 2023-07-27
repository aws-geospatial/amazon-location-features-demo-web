import { useEffect } from "react";

import { EventTypeEnum } from "@demo/types/Enums";

import { record } from "@demo/utils/analyticsUtils";

let pageViewDateTime: Date;

const useRecordViewPage = (pageName: string) => {
	useEffect(() => {
		const path = location.pathname;
		pageViewDateTime = new Date();
		record([{ EventType: EventTypeEnum.VIEW_PAGE, Attributes: { path, pageName } }]);

		return () => {
			const pageViewDuration = String((new Date().getTime() - pageViewDateTime.getTime()) / 1000 / 60);
			record([{ EventType: EventTypeEnum.LEAVE_PAGE, Attributes: { path, pageName, pageViewDuration } }]);
		};
	}, [pageName]);

	return {};
};

export default useRecordViewPage;
