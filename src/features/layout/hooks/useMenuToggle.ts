import { useState } from "react";

/**
 * Custom hook for managing dropdown/menu open/close state
 */
export const useMenuToggle = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, toggle, open, close, setIsOpen };
};

export default useMenuToggle;

