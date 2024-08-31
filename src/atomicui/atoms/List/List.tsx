/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, ReactNode } from "react";

import { Flex, Link, Text, View, ViewProps } from "@aws-amplify/ui-react";
import { IconArrow } from "@demo/assets/svgs";
import { uuid } from "@demo/utils/uuid";
import { omit } from "ramda";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

interface ListArr {
	label: string;
	link?: string;
	iconBeforeLink?: string;
	iconContainerClass?: string;
	subMenu?: {
		label: string;
		link?: string;
		isExternalLink?: boolean;
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
	hasSubMenuItems?: boolean;
}

const LinkWrapper: React.FC<LinkWrapperProps> = ({
	isExternalLink = false,
	linkTo = "#",
	children,
	className,
	hasSubMenuItems = false
}) => {
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
				`${className} navigation-link ${isActive && linkTo !== "#" ? "amplify-text isActive" : "amplify-text"}`
			}
			style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
			target="_self"
		>
			{children}
			{hasSubMenuItems && (
				<IconArrow style={{ width: "1.3rem", height: "1.3rem", fill: "var(--primary-color)", rotate: "-90deg" }} />
			)}
		</NavLink>
	);
};

const List: FC<ListProps> = ({
	listArray,
	useDefaultStyles = false,
	labelIsIcon = false,
	hideIcons = false,
	...props
}) => {
	const { t } = useTranslation();
	let ulClass = props.className;

	/* Download css only if the component useDefaultStyles prop is true */
	const shouldUseDefaultStyles = Boolean(useDefaultStyles);
	if (shouldUseDefaultStyles) {
		ulClass = `ul__container ${props.className}`;
		import("./styles.scss");
	}

	const checkIfExternalLink = (link: string): boolean =>
		!!(link?.startsWith("https://") || link?.startsWith("http://") || link?.startsWith("#"));

	return (
		<View data-testid="list-container" as="ul" className={ulClass} {...omit(["className"], props)}>
			{listArray.map(item => {
				const isExternalLink = checkIfExternalLink(item?.link || "#");
				const hasSubMenuItems = !!item.subMenu?.length;

				return (
					<li data-testid={item.label} key={uuid.randomUUID()} className="list-item">
						{hideIcons ? null : (
							<Flex data-testid="list-item-icon-before-link" className={item.iconContainerClass}>
								<img loading="lazy" src={item.iconBeforeLink} />
							</Flex>
						)}
						<LinkWrapper
							className={hasSubMenuItems ? "link-with-sub-links" : ""}
							isExternalLink={isExternalLink}
							linkTo={item?.link || "#"}
							hasSubMenuItems={!!hasSubMenuItems}
						>
							{labelIsIcon ? <img loading="lazy" src={item.label} /> : t(item.label)}
						</LinkWrapper>
						{hasSubMenuItems && (
							<View className="sub-menu-container">
								{item.subMenu?.map((subMenuItem, index) => (
									<Link
										key={String(index)}
										className="sub-menu-item"
										href={subMenuItem.link!}
										isExternal={checkIfExternalLink(subMenuItem.link || "#") || !!subMenuItem?.isExternalLink}
									>
										<Text className="sub-menu-item-label">{t(subMenuItem.label)}</Text>
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
