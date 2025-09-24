import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import AppRoutes from './routes/AppRoutes';
import { PermissionsProvider } from './contexts/PermissionsContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <PermissionsProvider>
          <AppRoutes />
        </PermissionsProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
