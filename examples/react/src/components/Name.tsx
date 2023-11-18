import React from "react";
import "./componentCss.css";

interface NameProps {
  children?: React.ReactNode;
}

export const Name: React.FC<NameProps> = ({ children }) => {
  return <div className="name">{children}</div>;
};
