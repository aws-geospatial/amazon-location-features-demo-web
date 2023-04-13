/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Text, View } from "@aws-amplify/ui-react";
import { IconSearch } from "@demo/assets";
import "./styles.scss";

const NotFoundCard: React.FC = () => (
	<View className="not-found-card">
		<IconSearch className="nfc-search-icon" />
		<Text className="nfc-title">No matching places found</Text>
		<Text className="nfc-text" variation="tertiary">
			Make sure your search is spelled correctly. Try adding a city, country or postcode.
		</Text>
	</View>
);

export default NotFoundCard;
