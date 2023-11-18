import "./componentCss.css";
export interface CardProps {
  children?: React.ReactNode;
  color?: string;
}

export const Card: React.FC<CardProps> = ({ children, color = '#BAFFFA' }) => {
  return <div className="card" style={{backgroundColor: color }}>{children}</div>;
};
