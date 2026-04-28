import { request } from "./client";

export function getSurveys(token) {
  // Данные dashboard защищены, поэтому JWT отправляется как Bearer token.
  return request("/api/surveys", {
    token,
  });
}
