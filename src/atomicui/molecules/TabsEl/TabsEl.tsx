/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Flex, TabItem, Tabs, Text, View } from "@aws-amplify/ui-react";
import { IconBook } from "@demo/assets";
import "./styles.scss";

interface TabsProps {
	title?: string;
	tabsConfig: {
		title: string;
		body: string | JSX.Element;
	}[];
}

const TabsEl: React.FC<TabsProps> = ({ title, tabsConfig }) => (
	<View className="tabs-container">
		{!!title && (
			<Flex className="title-container">
				<IconBook />
				<Text className="medium-text" color={"var(--primary-color)"}>
					{title}
				</Text>
			</Flex>
		)}
		<Tabs backgroundColor={"var(--grey-ultra-light-color)"} border={"none"}>
			{tabsConfig.map((tabItem, index) => {
				return (
					<TabItem className="tab-item small-text" key={index} title={tabItem.title}>
						{tabItem.body}
					</TabItem>
				);
			})}
		</Tabs>
	</View>
);

export default TabsEl;
