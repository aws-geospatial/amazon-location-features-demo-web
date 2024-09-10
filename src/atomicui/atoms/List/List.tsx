/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, ReactNode, useState } from "react";

import { Flex, Link, Text, View, ViewProps } from "@aws-amplify/ui-react";
import { IconArrow } from "@demo/assets/svgs";
import { appConfig } from "@demo/core/constants";
import { uuid } from "@demo/utils/uuid";
import { omit } from "ramda";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const {
	ENV: { SHOW_NEW_NAVIGATION }
} = appConfig;

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
			<Link
				isExternal={linkTo === "#" ? false : true}
				href={hasSubMenuItems ? undefined : linkTo}
				className={`${className} amplify-text`}
			>
				{children}
				{hasSubMenuItems && (
					<IconArrow style={{ width: "1.3rem", height: "1.3rem", fill: "var(--primary-color)", rotate: "-90deg" }} />
				)}
			</Link>
		);
	} else {
		const currentSplitHref = window.location.href.split("/");

		return (
			<NavLink
				to={hasSubMenuItems ? `/${currentSplitHref[currentSplitHref.length - 1]}` : linkTo}
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
	}
};

const List: FC<ListProps> = ({
	listArray,
	useDefaultStyles = false,
	labelIsIcon = false,
	hideIcons = false,
	...props
}) => {
	const [pos, setPos] = useState<number | null>(null);
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
			{listArray.map(({ link, subMenu, label, iconContainerClass, iconBeforeLink }) => {
				const isExternalLink = checkIfExternalLink(link || "#");
				const hasSubMenuItems = !!subMenu?.length;

				return (
					<li
						data-testid={label}
						key={uuid.randomUUID()}
						className={SHOW_NEW_NAVIGATION ? "new-list-item" : "list-item"}
						onMouseEnter={e => hasSubMenuItems && setPos(subMenu.length > 5 ? e.clientY - 100 : e.clientY - 50)}
						onMouseLeave={() => hasSubMenuItems && setPos(null)}
					>
						{hideIcons ? null : (
							<Flex data-testid="list-item-icon-before-link" className={iconContainerClass}>
								<img loading="lazy" src={iconBeforeLink} />
							</Flex>
						)}
						<LinkWrapper
							className={hasSubMenuItems ? "link-with-sub-links" : ""}
							isExternalLink={isExternalLink}
							linkTo={link || "#"}
							hasSubMenuItems={!!hasSubMenuItems}
						>
							{labelIsIcon ? <img loading="lazy" src={label} /> : t(label)}
						</LinkWrapper>
						{hasSubMenuItems && !SHOW_NEW_NAVIGATION && (
							<View className="sub-menu-container">
								{subMenu.map(({ link, isExternalLink, label }, idx) => (
									<Link
										key={String(idx)}
										className="sub-menu-item"
										href={link}
										isExternal={checkIfExternalLink(link || "#") || !!isExternalLink}
									>
										<Text className="sub-menu-item-label">{t(label)}</Text>
									</Link>
								))}
							</View>
						)}
						{hasSubMenuItems && SHOW_NEW_NAVIGATION && (
							<Flex className="new-sub-menu-container-outer" top={pos ? pos : undefined}>
								<Flex className="new-sub-menu-container-inner">
									{subMenu.map(({ link, isExternalLink, label }, idx) => (
										<Link key={`${idx}-${label}`} className="new-sub-menu-item" href={link} isExternal={isExternalLink}>
											<Text className="new-sub-menu-item-label">{t(label)}</Text>
										</Link>
									))}
								</Flex>
							</Flex>
						)}
					</li>
				);
			})}
		</View>
	);
};

export default List;
