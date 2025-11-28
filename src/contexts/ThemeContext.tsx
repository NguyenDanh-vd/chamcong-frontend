"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { ConfigProvider, App, theme as antdTheme } from "antd";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Load từ localStorage hoặc system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    setTheme(saved || (systemPrefersDark ? "dark" : "light"));
  }, []);

  // Apply vào HTML + lưu vào localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const setThemeMode = (mode: ThemeMode) => setTheme(mode);

  const antdAlgorithm =
    theme === "dark"
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      <ConfigProvider
        theme={{
          algorithm: antdAlgorithm,
          token: {
            colorPrimary: "#1677ff",
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
