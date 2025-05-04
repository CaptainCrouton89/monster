import { useEffect } from "react";

export const useMobileHeight = () => {
  useEffect(() => {
    if (!window.visualViewport) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.visualViewport!.height}px`
      );
    };

    // listen for viewport changes (resize/scroll affects height)
    window.visualViewport.addEventListener("resize", updateHeight);
    window.visualViewport.addEventListener("scroll", updateHeight);

    // set initial value
    updateHeight();

    return () => {
      window.visualViewport!.removeEventListener("resize", updateHeight);
      window.visualViewport!.removeEventListener("scroll", updateHeight);
    };
  }, []);
};
