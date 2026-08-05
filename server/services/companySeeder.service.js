/**
 * companySeeder.service.js  (disabled)
 *
 * The old seeder pre-populated companies using the search pipeline.
 * Companies are now fetched on-demand from Google Places API and
 * cached in the DB automatically — no pre-seeding needed.
 */
export async function seedCompaniesIfEmpty() {
  // No-op — seeding is handled automatically by places.service.js
  return { skipped: true, reason: "On-demand Google Places caching active" };
}
