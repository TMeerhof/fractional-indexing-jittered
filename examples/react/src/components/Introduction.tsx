import React from "react";
import "./componentCss.css";

interface IntroductionProps {
  children?: React.ReactNode;
}

export const Introduction: React.FC<IntroductionProps> = ({ children }) => {
  return <div className="introduction">{children}</div>;
};
