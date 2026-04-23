import { request } from "./client";

export function getSurveys(token) {
  return request("/api/surveys", {
    token,
  });
}
