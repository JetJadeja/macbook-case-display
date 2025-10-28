/**
 * Application Configuration
 *
 * Centralized configuration using environment variables
 */

export const config = {
  backendUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:3001",
};
