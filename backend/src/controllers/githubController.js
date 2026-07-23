const { Settings } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok } = require("../utils/apiResponse");
const githubService = require("../services/githubService");

async function resolveUsername() {
  const [settingsRow] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  const username = settingsRow.githubUsername || null;
  return username;
}

const profile = asyncHandler(async (req, res) => {
  const username = await resolveUsername();
  if (!username) {
    // Not configured yet -- not an error, just nothing to show. The
    // frontend uses this to render a friendly "not connected" state
    // instead of an error page.
    return ok(res, { configured: false });
  }

  try {
    const bundle = await githubService.getProfileBundle(username);
    ok(res, { configured: true, ...bundle });
  } catch (err) {
    if (err.status === 404) {
      throw new ApiError(404, `GitHub user "${username}" was not found.`);
    }
    throw new ApiError(502, "Couldn't reach GitHub right now. Please try again shortly.");
  }
});

const readme = asyncHandler(async (req, res) => {
  const username = await resolveUsername();
  if (!username) throw new ApiError(404, "GitHub integration is not configured.");

  try {
    const result = await githubService.getReadme(username, req.params.repo);
    ok(res, result);
  } catch (err) {
    if (err.status === 404) {
      throw new ApiError(404, "This repository has no README.");
    }
    throw new ApiError(502, "Couldn't reach GitHub right now. Please try again shortly.");
  }
});

module.exports = { profile, readme };
