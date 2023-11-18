export const Button = ({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) => (
  <button onClick={onClick} style={{ margin: "3px" }}>
    {children}
  </button>
);
