import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Loading component for lazy loading
const LoadingFallback = ({ message = "Loading..." }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Lazy wrapper component
const LazyWrapper = ({ children, fallbackMessage }) => (
  <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
    {children}
  </Suspense>
);

export default LazyWrapper;
