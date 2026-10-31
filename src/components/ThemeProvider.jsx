import { useEffect } from "react";

const isAndroid = () => /android/i.test(navigator.userAgent);

export default function ThemeProvider({ children }) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle("dark", isAndroid() || mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return children;
}