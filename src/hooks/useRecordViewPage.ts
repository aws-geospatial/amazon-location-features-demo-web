import { useEffect } from "react";

import { EventTypeEnum } from "@demo/types/Enums";

import { record } from "@demo/utils/analyticsUtils";

const useRecordViewPage = (pageName: string) => {
	useEffect(() => {
		const path = location.pathname;

		record([{ EventType: EventTypeEnum.VIEW_PAGE, Attributes: { path, pageName } }]);

		return () => record([{ EventType: EventTypeEnum.LEAVE_PAGE, Attributes: { path, pageName } }]);
	}, [pageName]);

	return {};
};

export default useRecordViewPage;
