import { Position, bbox, lineString } from "@turf/turf";

export const getBoundsFromLineString = (ls: Position[]) => {
	if (ls.length >= 2 && ls.every(_ls => _ls !== undefined)) {
		const line = lineString(ls);
		const bounds = bbox(line);
		return bounds as [number, number, number, number];
	}
};
