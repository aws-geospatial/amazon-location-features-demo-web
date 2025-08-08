import React from "react";

export const IconClose = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-testid="icon-close" onClick={props.onClick} />
);

export const IconCompass = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-testid="icon-compass" onClick={props.onClick} />
);

export const IconGear = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-testid="icon-gear" onClick={props.onClick} />
);

export const IconInfo = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-testid="icon-info" onClick={props.onClick} />
);

export const IconRadar = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-testid="icon-radar" onClick={props.onClick} />
);
