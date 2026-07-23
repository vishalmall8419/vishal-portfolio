/**
 * Every successful response follows { success: true, data, pagination? }.
 * This matches what the existing admin frontend already reads (`data.data`,
 * `data.pagination`) — see src/admin/hooks/useResourceList.js in the frontend.
 */
const ok = (res, data, extra = {}, status = 200) =>
  res.status(status).json({ success: true, data, ...extra });

const created = (res, data, extra = {}) => ok(res, data, extra, 201);

const noContent = (res) => res.status(204).send();

module.exports = { ok, created, noContent };
