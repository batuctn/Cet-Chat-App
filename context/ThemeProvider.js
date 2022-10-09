import React, { useState } from "react";
import { ThemeContext } from "../context/Theme";

import darkTheme from "../contants/dark";
import lightTheme from "../contants/light";

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  const handleToggleTheme = () => {
    if (theme.type === "light") {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme: handleToggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
