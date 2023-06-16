import { AttributeEnum, EsriMapEnum, MapProviderEnum, TypeEnum } from "./Enums";

export type MapStyleFilterTypes = {
	Providers: string[];
	Attribute: string[];
	Type: string[];
};

export interface MapStyle {
	id: EsriMapEnum;
	image: string;
	name: string;
	filters: {
		provider: MapProviderEnum;
		attribute: AttributeEnum[];
		type: TypeEnum[];
	};
}
