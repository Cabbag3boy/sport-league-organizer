import React from 'react';

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-4 py-2 font-semibold text-sm rounded-t-lg focus:outline-none transition-colors duration-300";
    const activeClasses = "bg-gray-800 text-indigo-400";
    const inactiveClasses = "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200";

    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {label}
        </button>
    );
};

export default TabButton;
