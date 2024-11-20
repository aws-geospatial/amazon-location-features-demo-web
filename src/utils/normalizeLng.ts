export const normalizeLng = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180; // Normalize to [-180, 180];
