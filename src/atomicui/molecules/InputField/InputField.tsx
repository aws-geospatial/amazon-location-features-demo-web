/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import {
	ChangeEvent,
	FC,
	FocusEventHandler,
	HTMLInputTypeAttribute,
	KeyboardEventHandler,
	ReactNode,
	RefObject
} from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import "./styles.scss";

interface InputFieldProps {
	dataTestId?: string;
	containerMargin?: string;
	labelMargin?: string;
	label?: string;
	placeholder?: string;
	value: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	innerEndComponent?: ReactNode;
	innerStartComponent?: ReactNode;
	type?: HTMLInputTypeAttribute;
	disabled?: boolean;
	dir?: "rtl" | "ltr";
	onFocus?: FocusEventHandler<HTMLInputElement>;
	onBlur?: FocusEventHandler<HTMLInputElement>;
	onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
	searchInputRef?: RefObject<HTMLInputElement>;
	name?: string;
	autocomplete?: string;
}

const InputField: FC<InputFieldProps> = ({
	dataTestId,
	containerMargin,
	labelMargin = "0px 0px 8px 0px",
	label,
	placeholder,
	value,
	onChange,
	innerEndComponent,
	type = "text",
	disabled = false,
	dir = "ltr",
	onFocus,
	onBlur,
	innerStartComponent,
	searchInputRef,
	onKeyDown,
	name,
	autocomplete
}) => {
	return (
		<Flex gap="0" direction="column" width="100%" margin={containerMargin}>
			{label && (
				<Text className="bold" margin={labelMargin} textAlign={dir === "ltr" ? "start" : "end"}>
					{label}
				</Text>
			)}
			<Flex className={disabled ? "input-container disabled" : "input-container"} gap="0" alignContent="center">
				{innerStartComponent}
				<input
					ref={searchInputRef}
					data-testid={dataTestId || "input-field"}
					style={{ order: dir === "ltr" ? 0 : 1 }}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					type={type}
					disabled={disabled}
					dir={dir}
					onFocus={onFocus}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					name={name}
					autoComplete={autocomplete}
				/>
				{innerEndComponent}
			</Flex>
		</Flex>
	);
};

export default InputField;
