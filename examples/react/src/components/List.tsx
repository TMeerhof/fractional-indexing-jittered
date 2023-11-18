import React from "react";
import "./componentCss.css";

interface ListProps {
  children?: React.ReactNode;
}

export const List: React.FC<ListProps> = ({ children }) => {
  return <div className="list">{children}</div>;
};
