import "./componentCss.css";
export interface ButtonBarProps {
  children?: React.ReactNode;
}

export const ButtonBar: React.FC<ButtonBarProps> = ({ children }) => {
  return <div className="button-bar">{children}</div>;
};
