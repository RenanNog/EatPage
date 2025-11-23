import axios from 'axios';

const API_BASE_URL = 'https://eatapi.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tipos
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  authority: string;
  customerId: string | null;
  customerName: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string | null;
}

export interface Employee {
  id: string;
  nome: string;
  matricula: string;
  fingerprint_id: string | null;
  setor: string | null;
  created_time: number;
}

export interface CreateEmployeeRequest {
  nome: string;
  matricula: string;
  fingerprint_id: string | null;
  setor: string | null;
}

export interface MealReport {
  employee_id: string;
  employee_name: string;
  employee_setor: string | null;
  meal_type: string;
  timestamp: number;
}

// Auth
export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/api/login', data);

export const getProfile = () =>
  api.get<UserProfile>('/api/profile');

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/api/profile/change-password', { currentPassword, newPassword });

// Employees
export const getEmployees = () =>
  api.get<Employee[]>('/api/employees');

export const createEmployee = (data: CreateEmployeeRequest) =>
  api.post<Employee>('/api/employees', data);

export const updateEmployee = (assetId: string, data: Partial<CreateEmployeeRequest>) =>
  api.put<Employee>(`/api/employees/${assetId}`, data);

export const deleteEmployee = (assetId: string) =>
  api.delete(`/api/employees/${assetId}`);

// Meals
export function setMealPassword(assetId: string, password: string) {
  return api.post(`/api/employees/${assetId}/set-password`, { password });
}

export function registerMeal(assetId: string, mealType: string, password: string) {
  return api.post(`/api/employees/${assetId}/register-meal`, {
    meal_type: mealType,
    password
  });
}

export function getMealsReport(startTs: number, endTs: number, assetId?: string) {
  const params: Record<string, any> = { start_ts: startTs, end_ts: endTs };
  if (assetId) {
    params.asset_id = assetId;
  }
  return api.get<MealReport[]>('/api/employees/meals-report', { params });
}
