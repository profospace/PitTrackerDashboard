import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Reusable CustomButton Component
 * @param {string} label - Button text
 * @param {string} to - Optional navigation path (e.g. "/pothole/123")
 * @param {function} onClick - Optional click handler (if you want custom logic)
 * @param {string} color - Tailwind color name (default: blue)
 * @param {string} className - Extra Tailwind classes
 */
const CustomButton = ({ label, to, onClick, color = "blue", className = "" }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) navigate(to);
        if (onClick) onClick();
    };

    return (
        <button
            onClick={handleClick}
            className={`px-4 py-2 rounded-lg bg-${color}-600 text-white font-medium shadow-md 
                  hover:bg-${color}-700 active:scale-95 transition duration-200 ${className}`}
        >
            {label}
        </button>
    );
};

export default CustomButton;
