import axios from 'axios';

const API_BASE_URL = 'http://localhost:8003/api/v1';

// Configuración base de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resolver ecuaciones
export const solveEquation = async (query) => {
  try {
    const response = await apiClient.post('/solve/', { query });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Calcular integral
export const calculateIntegral = async (query) => {
  try {
    const response = await apiClient.post('/integrate/', { query });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Calcular derivada
export const calculateDerivative = async (query) => {
  try {
    const response = await apiClient.post('/differentiate/', { query });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};