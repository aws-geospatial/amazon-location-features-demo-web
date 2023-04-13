/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { CheckboxField, Text, View } from "@aws-amplify/ui-react";

import "./styles.scss";

interface CheckboxGroupProps {
	title: string;
	options: { label: string; value: string }[];
	values: string[];
	onChange: (values: string[]) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, options, values: currentValues, onChange }) => {
	const handleClick = (value: string, isChecked: boolean): void => {
		let newSelectedValues: string[] = [];
		if (isChecked) {
			newSelectedValues = [...currentValues, value];
		} else {
			newSelectedValues = currentValues.filter(selectedValue => selectedValue !== value);
		}

		onChange(newSelectedValues);
	};

	return (
		<View className="checkbox-group">
			<Text className="bold medium-text">{title}</Text>
			{options.map(option => (
				<CheckboxField
					className="regular-text"
					key={option.value}
					name={option.label}
					label={option.label}
					value={option.value}
					checked={currentValues.includes(option.value)}
					onClick={e => handleClick(option.value, e.currentTarget.checked)}
				/>
			))}
		</View>
	);
};

export default CheckboxGroup;
