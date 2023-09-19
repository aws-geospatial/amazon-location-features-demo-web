/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Theme } from "@aws-amplify/ui-react";

const appTheme: Theme = {
	name: "aws-location-theme",
	tokens: {
		fonts: {
			default: {
				static: {
					value: "AmazonEmber-Regular"
				},
				variable: {
					value: "AmazonEmber-Regular"
				}
			}
		},
		lineHeights: {
			small: { value: 1.333 },
			medium: { value: 1.385 },
			large: { value: 1.636 }
		},
		components: {
			text: {
				color: { value: "var(--heading-text-color)" },
				primary: {
					color: { value: "var(--primary-text-color)" }
				},
				secondary: {
					color: { value: "var(--heading-text-color)" }
				},
				tertiary: {
					color: { value: "var(--secondary-text-color)" }
				},
				error: {
					color: { value: "var(--error-text-color)" }
				},
				warning: {
					color: { value: "var(--warning-text-color)" }
				},
				success: {
					color: { value: "var(--success-text-color)" }
				},
				info: {
					color: { value: "var(--info-text-color)" }
				}
			},
			fieldcontrol: {
				outlineColor: { value: "transparent" },
				outlineStyle: { value: "none" }
			},
			autocomplete: {
				menu: {
					options: {
						maxHeight: { value: "80vh" }
					},
					width: { value: "360px" },
					borderStyle: { value: "none" },
					borderRadius: { value: "8px" },
					option: {
						color: { value: "var(--tertiary-color)" },
						_active: {
							color: { value: "var(--tertiary-color)" },
							backgroundColor: { value: "var(--hovered-menu-backround-color)" }
						}
					}
				}
			},
			button: {
				fontWeight: { value: 0 },
				lineHeight: { value: "16px" },
				borderRadius: { value: "8px" },
				color: { value: "var(--tertiary-color)" },
				primary: {
					backgroundColor: { value: "var(--primary-color)" },
					borderColor: { value: "var(--primary-color)" },
					_focus: {
						backgroundColor: { value: "var(--primary-contrast-color)" },
						borderColor: { value: "var(--primary-contrast-color)" },
						boxShadow: { value: "var(--primary-contrast-color)" }
					},
					_active: {
						backgroundColor: {
							value: "var(--primary-color)"
						},
						borderColor: {
							value: "var(--primary-color)"
						}
					},
					_hover: {
						backgroundColor: {
							value: "var(--primary-contrast-color)"
						},
						borderColor: {
							value: "var(--primary-contrast-color)"
						}
					},
					_loading: {
						color: { value: "var(--tertiary-color)" },
						backgroundColor: {
							value: "var(--primary-color)"
						},
						borderColor: {
							value: "transparent"
						}
					},
					_disabled: {
						color: { value: "var(--grey-contrast-color)" },
						backgroundColor: {
							value: "var(--grey-color-5)"
						},
						borderColor: {
							value: "transparent"
						}
					}
				},
				link: {
					color: { value: "var(--tertiary-color)" },
					borderColor: {
						value: "transparent"
					}
				}
			},
			card: {
				backgroundColor: { value: "{colors.white}" },
				borderWidth: { value: "0px" },
				borderStyle: { value: "solid" },
				borderColor: { value: "{colors.white}" },
				borderRadius: { value: "8px" },
				boxShadow: { value: "0px 0px 10px rgba(0,0,0, 0.202633)" },
				padding: { value: "0px 0px 0px 0px" }
			},
			badge: {
				borderRadius: { value: "8px" },
				backgroundColor: { value: "#E5E5EA" }
			},
			textfield: {
				color: { value: "var(--tertiary-color)" },
				borderColor: { value: "var(--border-color-textfield)" },
				fontSize: { value: "14px" },
				_focus: { borderColor: { value: "var(--primary-color)" } }
			},
			radio: {
				button: {
					width: { value: "1.54rem" },
					height: { value: "1.54rem" },
					borderWidth: { value: "1px" },
					borderColor: { value: "var(--grey-color-2)" },
					color: { value: "var(--white-color)" },
					padding: { value: "3px" },
					_checked: {
						color: {
							value: "var(--primary-color)"
						}
					},
					_focus: {
						borderColor: { value: "var(--grey-color-2)" },
						boxShadow: { value: "none" }
					}
				}
			},
			selectfield: {
				color: { value: "var(--heading-text-color)" },
				borderColor: { value: "var(--grey-color-1)" },
				fontSize: { value: "1rem" },
				_focus: {
					borderColor: {
						value: "var(--grey-color-1)"
					}
				},
				label: { color: { value: "var(--heading-text-color)" } }
			}
		}
	}
};

export default appTheme;
