import { FC } from "react";
import "./styles.scss";

interface ToggleSwitchProps {
	isToggled: boolean;
	setIsToggled: (isToggled: boolean) => void;
	label: string;
	disabled?: boolean;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({ isToggled, setIsToggled, label, disabled = false }) => {
	const handleToggle = () => !disabled && setIsToggled(!isToggled);

	return (
		<div className={`toggle-switch ${disabled ? "disabled" : ""}`}>
			<div className={`switch ${isToggled ? "toggled" : ""}`} onClick={handleToggle}>
				<div className="slider"></div>
			</div>
			<span className="label">{label}</span>
		</div>
	);
};

export default ToggleSwitch;
