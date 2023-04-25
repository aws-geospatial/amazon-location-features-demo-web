/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useEffect, useState } from "react";

import { Badge, Button, Flex, Text, View } from "@aws-amplify/ui-react";

import "./styles.scss";
import { IconCheck, IconClose } from "assets";

import { Modal } from "../Modal";

interface FilterModalProps {
	isOpen: boolean;
	title: string;
	options: {
		key: string;
		title: string;
		options: {
			label: string;
			value: string;
		}[];
	}[];

	values: {
		[key: string]: string[];
	};

	onChange: (values: { [key: string]: string[] }) => void;
	onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, title, options, values, onChange, onClose }) => {
	const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
	const [selectedValuesPerSelectedCategory, setSelectedValuesPerSelectedCategory] = useState<string[]>([]);
	const [selectedValues, setSelectedValues] = useState<typeof values>({});

	const handleOptionClick = (category: string, value: string, isChecked: boolean) => () => {
		setSelectedValuesPerSelectedCategory(prevSelectedValues => {
			let newSelectedValues: string[] = [];
			if (isChecked) {
				newSelectedValues = [...prevSelectedValues, value];
			} else {
				newSelectedValues = prevSelectedValues.filter(selectedValue => selectedValue !== value);
			}

			return newSelectedValues;
		});
	};

	const handleCategorySelection = (category: string) => {
		setSelectedValuesPerSelectedCategory(selectedValues[category] || []);
		setSelectedCategory(category);
	};

	const handleBackClick = () => {
		handleClear();
		setSelectedCategory(null);
	};

	const handleClear = () => setSelectedValuesPerSelectedCategory([]);

	const handleApplyClick = () => {
		setSelectedValues(prevSelectedValues => ({
			...prevSelectedValues,
			[selectedCategory!]: selectedValuesPerSelectedCategory
		}));

		handleBackClick();
	};

	const handleDoneClick = () => {
		onChange(selectedValues);
		onClose();
	};

	useEffect(() => {
		if (isOpen) {
			setSelectedValues(values);
		}
	}, [isOpen, values]);

	return (
		<Modal
			data-testid="filter-modal-container"
			open={isOpen}
			onClose={onClose}
			modalContainerClass="filter-modal-container"
			modalContainerPosition={"fixed"}
			className="filter-modal"
			hideCloseIcon
			content={
				<Flex className="filter-modal-content">
					<Flex className="title-bar">
						{selectedCategory ? (
							<Text className="back" onClick={handleBackClick}>
								{"<"}
							</Text>
						) : (
							<View />
						)}

						<Text className="title">{title}</Text>

						{selectedCategory ? (
							<Button className="clear-button" onClick={handleClear} variation="link">
								Clear
							</Button>
						) : (
							<IconClose className="close-icon" onClick={onClose} />
						)}
					</Flex>

					{selectedCategory ? (
						<View className="options-container">
							{options
								.find(category => category.key === selectedCategory)!
								.options.map((sampleListFilter, idx) => {
									const isSelected = selectedValuesPerSelectedCategory.includes(sampleListFilter.value);

									return (
										<Flex
											data-testid={`option-${idx}`}
											key={sampleListFilter.value}
											className="option"
											onClick={handleOptionClick(selectedCategory, sampleListFilter.value, !isSelected)}
										>
											<Text className="option-label">{sampleListFilter.label}</Text>
											{isSelected && <IconCheck height={20} width={20} />}
										</Flex>
									);
								})}
						</View>
					) : (
						<View className="category-container">
							{options.map((sampleListFilter, idx) => {
								const selectedFiltersCount = (selectedValues?.[sampleListFilter.key] || [])?.length;

								return (
									<Flex
										data-testid={`category-${idx}`}
										key={sampleListFilter.key}
										className="category"
										onClick={() => handleCategorySelection(sampleListFilter.key)}
									>
										<Text>{sampleListFilter.title}</Text>
										{!!selectedFiltersCount && (
											<Badge data-testid={`counter-badge-${idx}`} className="counter-badge">
												{selectedFiltersCount}
											</Badge>
										)}
									</Flex>
								);
							})}
						</View>
					)}

					{selectedCategory ? (
						<Button className="submit-button" variation="primary" onClick={handleApplyClick}>
							APPLY
						</Button>
					) : (
						<Button className="submit-button" variation="primary" onClick={handleDoneClick}>
							DONE
						</Button>
					)}
				</Flex>
			}
		/>
	);
};

export default FilterModal;
