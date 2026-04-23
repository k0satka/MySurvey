import { request } from "./client";

export function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}
