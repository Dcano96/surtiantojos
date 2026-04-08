import { ThemeProvider, createTheme } from "@mui/material/styles";
import Login from "./features/auth/Login";

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Login />
      </div>
    </ThemeProvider>
  );
}

export default App;