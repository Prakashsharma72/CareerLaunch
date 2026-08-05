/**
 * jobSeeder.service.js  (disabled)
 *
 * Fake/seed jobs have been removed. Jobs are sourced exclusively
 * from the Google Places API via places.service.js.
 */
export async function seedJobsIfEmpty() {
  return { skipped: true, reason: "Jobs sourced from Google Places API" };
}
