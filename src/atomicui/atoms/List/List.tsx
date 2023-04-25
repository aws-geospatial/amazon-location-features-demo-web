/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ReactNode } from "react";

import { Flex, Link, Text, View, ViewProps } from "@aws-amplify/ui-react";
import { omit } from "ramda";
import { NavLink } from "react-router-dom";

import { uuid } from "utils/uuid";

interface ListArr {
	label: string;
	link?: string;
	iconBeforeLink?: string;
	iconContainerClass?: string;
	subMenu?: {
		label: string;
		link?: string;
	}[];
}

interface ListProps extends ViewProps {
	listArray: ListArr[];
	useDefaultStyles?: boolean;
	labelIsIcon?: boolean;
	hideIcons?: boolean;
}

interface LinkWrapperProps {
	isExternalLink: boolean | undefined;
	linkTo: string;
	children: ReactNode;
	className?: string;
}

const LinkWrapper: React.FC<LinkWrapperProps> = ({ isExternalLink = false, linkTo = "#", children, className }) => {
	if (isExternalLink) {
		return (
			<Link isExternal={linkTo === "#" ? false : true} href={linkTo} className={`${className} amplify-text`}>
				{children}
			</Link>
		);
	}

	return (
		<NavLink
			to={linkTo}
			className={({ isActive }) =>
				`${className} navigation-link ${isActive ? "amplify-text isActive" : "amplify-text"}`
			}
		>
			{children}
		</NavLink>
	);
};

const List: React.FC<ListProps> = ({
	listArray,
	useDefaultStyles = false,
	labelIsIcon = false,
	hideIcons = false,
	...props
}) => {
	let ulClass = props.className;
	/* Download css only if the component useDefaultStyles prop is true */
	const shouldUseDefaultStyles = Boolean(useDefaultStyles);
	if (shouldUseDefaultStyles) {
		ulClass = `ul__container ${props.className}`;
		import("./styles.scss");
	}

	const checkIfExternalLink = (link: string): boolean =>
		!!(
			link?.startsWith("https://") ||
			link?.startsWith("http://") ||
			link?.startsWith("#") ||
			link?.startsWith("/showcase")
		);

	return (
		<View data-testid="list-container" as="ul" className={ulClass} {...omit(["className"], props)}>
			{listArray.map(item => {
				const isExternalLink = checkIfExternalLink(item?.link || "#");

				return (
					<li key={uuid.randomUUID()} className="list-item">
						{hideIcons ? null : (
							<Flex data-testid="list-item-icon-before-link" className={item.iconContainerClass}>
								<img loading="lazy" src={item.iconBeforeLink} />
							</Flex>
						)}
						<LinkWrapper
							className={item.subMenu?.length ? "link-with-sub-links" : ""}
							isExternalLink={isExternalLink}
							linkTo={item?.link || "#"}
						>
							{labelIsIcon ? <img loading="lazy" src={item.label} /> : item.label}
						</LinkWrapper>

						{item.subMenu?.length && (
							<View className="sub-menu-container">
								{item.subMenu.map((subMenuItem, index) => (
									<Link
										key={String(index)}
										className="sub-menu-item"
										href={subMenuItem.link!}
										isExternal={checkIfExternalLink(subMenuItem.link || "#")}
									>
										<Text className="sub-menu-item-label">{subMenuItem.label}</Text>
									</Link>
								))}
							</View>
						)}
					</li>
				);
			})}
		</View>
	);
};

export default List;
