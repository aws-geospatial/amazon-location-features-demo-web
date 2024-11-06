import { MapUnitEnum } from "@demo/types";

export const getConvertedDistance = (mapUnit: MapUnitEnum, distance: number) => {
	const d = mapUnit === MapUnitEnum.METRIC ? distance / 1000 : distance / 1609;
	return parseFloat(d.toFixed(2));
};
