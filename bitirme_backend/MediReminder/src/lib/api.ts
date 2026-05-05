import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const expoHost = getExpoHost();
const expoApiUrl = expoHost ? `http://${expoHost}:3004/api` : null;

const defaultApiUrls = Platform.select({
  android: [
    expoApiUrl,
    'http://10.0.2.2:3004/api', // Android emulator
    'http://192.168.1.29:3004/api',
    'http://192.168.1.100:3004/api', // Common router IP
    'http://localhost:3004/api',
  ],
  default: [
    expoApiUrl,
    'http://127.0.0.1:3004/api', // iOS simulator
    'http://localhost:3004/api',
    'http://192.168.1.29:3004/api',
    'http://192.168.1.100:3004/api',
  ],
}) ?? [expoApiUrl, 'http://127.0.0.1:3004/api'];

const API_BASE_URLS = configuredApiUrl
  ? [configuredApiUrl]
  : defaultApiUrls.filter((url): url is string => Boolean(url));

const API_BASE_URL = API_BASE_URLS[0];
const REQUEST_TIMEOUT_MS = 3000;
const RETRY_DELAY_MS = 500;

type RequestOptions = RequestInit & {
  token?: string;
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };

  let lastError: unknown;
  const errors: { url: string; error: string }[] = [];

  for (let i = 0; i < API_BASE_URLS.length; i++) {
    const baseUrl = API_BASE_URLS[i];
    
    // Add delay between retries (except for first attempt)
    if (i > 0) {
      await sleep(RETRY_DELAY_MS);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      console.log(`[API] Attempting ${i + 1}/${API_BASE_URLS.length}: ${baseUrl}${path}`);
      
      const response = await fetch(`${baseUrl}${path}`, {
        ...rest,
        headers: requestHeaders,
        signal: controller.signal,
      });

      const text = await response.text();
      const data = text ? safeParseJson(text) : {};

      if (!response.ok) {
        const message = getErrorMessage(data, response.status);
        throw new Error(message);
      }

      console.log(`[API] Success with ${baseUrl}${path}`);
      return data as T;
    } catch (error) {
      lastError = error;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({ url: baseUrl, error: errorMsg });
      console.log(`[API] Failed (${i + 1}/${API_BASE_URLS.length}): ${errorMsg}`);
              
      // Backend responded with an error (not a network error), so don't retry
      if (error instanceof Error && !isNetworkError(error)) {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const errorSummary = errors.slice(0, 2).map(e => `${e.url}: ${e.error}`).join('\n');
  const finalMessage = `Sunucuya bağlanılamadı.\n\nDüzeltme adımları:\n1. Backend servisinin 3004 portunda çalıştığını kontrol edin\n2. Cihazınızın bilgisayarınızla aynı ağda olduğunu kontrol edin\n3. Firewall ayarlarını kontrol edin\n4. Backend IP adresini güncelleyin\n\nDebug: ${errorSummary}`;
  
  throw lastError instanceof Error
    ? new Error(finalMessage)
    : new Error(finalMessage);
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(data: unknown, status: number) {
  if (typeof data === 'object' && data !== null) {
    const error = 'error' in data ? data.error : undefined;
    const message = 'message' in data ? data.message : undefined;

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return `HTTP ${status}`;
}

function isNetworkError(error: Error) {
  const message = error.message.toLowerCase();
  return (
    error.name === 'AbortError' ||
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('load failed') ||
    message.includes('timed out') ||
    message.includes('network timeout')
  );
}

function getExpoHost() {
  const possibleHosts = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const hostValue of possibleHosts) {
    const host = extractHost(hostValue);
    if (host) {
      return host;
    }
  }

  return null;
}

function extractHost(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.includes('://') ? value : `http://${value}`;

  try {
    return new URL(normalizedValue).hostname;
  } catch {
    return null;
  }
}

export type LoginResponse = {
  token: string;
};

export async function loginRequest(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
}

export async function registerRequest(name: string, email: string, password: string) {
  return request<{ message: string; userId: number }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email: email.trim().toLowerCase(), password, allergies: [] }),
  });
}

export type MedicationDto = {
  id: number;
  name: string;
  active_ingredient: string;
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string | null;
};

export async function getMedicationsRequest(token: string) {
  return request<MedicationDto[]>('/medications', {
    method: 'GET',
    token,
  });
}

export type CreateMedicationPayload = {
  name: string;
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string | null;
};

export async function createMedicationRequest(token: string, payload: CreateMedicationPayload) {
  return request<{ message: string; medicationId: number; alerts?: Array<{ description?: string; severity?: string; type?: string }>; note?: string }>('/medications', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function searchMedicationsRequest(token: string, query: string) {
  return request<{
    found: boolean;
    data: {
      name: string;
      generic_name?: string;
      active_ingredients?: string[];
      source: 'openfda' | 'user_input';
    };
  }>(`/medications/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    token,
  });
}

export async function deleteMedicationRequest(token: string, medicationId: string | number) {
  return request<{ message: string }>(`/medications/${medicationId}`, {
    method: 'DELETE',
    token,
  });
}

export type DrugInteraction = {
  medication1: MedicationDto;
  medication2: MedicationDto;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'severe';
  source: string;
};

export async function getDrugInteractionsRequest(token: string) {
  return request<{
    medications: MedicationDto[];
    interactions: DrugInteraction[];
    totalMedications: number;
    totalInteractions: number;
    message: string;
  }>('/medications/interactions/all', {
    method: 'GET',
    token,
  });
}

export type CommonDrug = {
  name: string;
  activeIngredient: string;
  category: string;
};

export async function getCommonDrugsRequest(token: string) {
  return request<{
    commonDrugs: CommonDrug[];
    total: number;
  }>('/medications/common', {
    method: 'GET',
    token,
  });
}

export type OpenFDADrug = {
  name: string;
  genericName: string;
  activeIngredients: string[];
  manufacturer: string;
};

export async function getAllDrugsRequest(token: string) {
  return request<{
    drugs: OpenFDADrug[];
    total: number;
    source: string;
  }>('/medications/all', {
    method: 'GET',
    token,
  });
}

export { API_BASE_URL, request };
