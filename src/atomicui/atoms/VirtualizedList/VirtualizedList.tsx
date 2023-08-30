import React, { FC, useEffect, useRef, useState } from "react";

const VirtualizedList: FC<{ listData: JSX.Element[] }> = ({ listData }) => {
	const [visibleItems, setVisibleItems] = useState<React.ReactNode[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const scrollTop = container.scrollTop;
			const offset = Math.floor(scrollTop / 50); // Assuming each item is 50px tall
			const numVisibleItems = Math.ceil(container.clientHeight / 50); // Assuming container height is divisible by item height
			const visibleItems = listData.slice(offset, offset + numVisibleItems);
			setVisibleItems(visibleItems);
		};

		container.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, [listData]);

	const containerHeight = listData.length * 50; // Total height of all items

	return (
		<div style={{ width: "100%", overflow: "auto" }} ref={containerRef}>
			<div style={{ height: `${containerHeight}px` }}>
				{listData.map((item, index) => (
					<div key={index} style={{ height: "50px" }}>
						{visibleItems.includes(item) ? item : null}
					</div>
				))}
			</div>
		</div>
	);
};

export default VirtualizedList;
