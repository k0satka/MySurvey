import { request } from "./client";

export function getSurveys(token) {
  // Dashboard data is protected, so the JWT is sent as Bearer token.
  return request("/api/surveys", {
    token,
  });
}
