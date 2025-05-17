/**
 * File cấu hình API
 */

// URL cơ sở của API backend
export const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Thời gian timeout cho request (milliseconds)
export const apiTimeout = 30000;

// Cấu hình CORS
export const corsConfig = {
  withCredentials: true
};
