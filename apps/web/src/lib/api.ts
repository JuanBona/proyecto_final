import type { UserRole } from "@/lib/session";

const API_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiErrorBody {
  message?: string;
  code?: string;
  statusCode?: number;
}

async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string; cache?: RequestCache } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    cache: options.cache ?? "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      body.message ?? `API request failed with status ${response.status}`,
      body.statusCode ?? response.status,
      body.code,
    );
  }

  return (await response.json()) as T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  email: string;
  role: UserRole;
}

export interface Trip {
  id: string;
  destination: string;
  reason: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  costCenter: string;
}

export interface CreateTripInput {
  destination: string;
  startDate: string;
  endDate: string;
  reason: string;
  budget: number;
  costCenter: string;
}

export interface SubmitExpenseInput {
  amount: number;
  category: string;
  description?: string;
}

export interface Expense {
  id: string;
  status: string;
  amount: number;
  category: string;
}

export function login(email: string, password: string) {
  return apiRequest<AuthTokens>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function getMe(accessToken: string) {
  return apiRequest<AuthUser>("/auth/me", {
    accessToken,
  });
}

export function createTrip(accessToken: string, input: CreateTripInput) {
  return apiRequest<Trip>("/trips", {
    method: "POST",
    accessToken,
    body: input,
  });
}

export function submitTrip(accessToken: string, tripId: string) {
  return apiRequest<Trip>(`/trips/${tripId}/submit`, {
    method: "POST",
    accessToken,
  });
}

export function getTrips(accessToken: string) {
  return apiRequest<Trip[]>("/trips", {
    accessToken,
  });
}

export function getPendingTrips(accessToken: string) {
  return getTrips(accessToken).then((trips) => trips.filter((trip) => trip.status === "pending_approval"));
}

export function approveTrip(accessToken: string, tripId: string, comment?: string) {
  return apiRequest<Trip>(`/trips/${tripId}/approve`, {
    method: "POST",
    accessToken,
    body: { comment },
  });
}

export function rejectTrip(accessToken: string, tripId: string, comment?: string) {
  return apiRequest<Trip>(`/trips/${tripId}/reject`, {
    method: "POST",
    accessToken,
    body: { comment },
  });
}

export function submitExpense(accessToken: string, tripId: string, input: SubmitExpenseInput) {
  return apiRequest<Expense>(`/expenses/${tripId}`, {
    method: "POST",
    accessToken,
    body: input,
  });
}
