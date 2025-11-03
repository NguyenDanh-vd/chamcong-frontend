import React from "react";
import { Button } from "antd";
import type { ButtonProps } from "antd";

interface CustomButtonProps extends ButtonProps {
  children?: React.ReactNode; 
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  icon,
  onClick,
  type = "default",
  danger = false,
  style,
  ...rest 
}) => {
  const baseStyle: React.CSSProperties = {
    background: danger
      ? "linear-gradient(135deg, #f87171, #ef4444)"
      : "linear-gradient(135deg, #06b6d4, #3b82f6)",
    color: "#fff",
    border: "none",
    fontWeight: 600,
    borderRadius: "8px",
    padding: children ? "8px 16px" : "8px", 
    minWidth: children ? "auto" : "40px",   
    height: "40px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    lineHeight: 1,
    verticalAlign: "middle", 
    ...style,
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.currentTarget.style.opacity = "0.9";
    e.currentTarget.style.transform = "translateY(-2px)";
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.currentTarget.style.opacity = "1";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <Button
      icon={icon}
      onClick={onClick}
      type={type}
      danger={danger}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest} 
    >
      {children}
    </Button>
  );
};

export default CustomButton;
