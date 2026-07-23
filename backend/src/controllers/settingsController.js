const { Settings, Admin } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok } = require("../utils/apiResponse");

const ALLOWED_ASSET_FIELDS = new Set(["logo", "favicon", "resume", "avatar", "aiAvatar"]);

const getSingleton = async () => {
  const [row] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  return row;
};

const get = asyncHandler(async (req, res) => {
  const row = await getSingleton();
  ok(res, row);
});

const update = asyncHandler(async (req, res) => {
  const row = await getSingleton();
  const {
    name,
    email,
    phone,
    role,
    address,
    experience,
    languages,
    careerObjective,
    currentFocus,
    aboutContent,
    socialLinks,
    stats,
    githubUsername,
    maintenanceMode,
    maintenanceMessage,
    maintenanceEndsAt,
    maintenanceSplineUrl,
    aiEnabled,
    aiName,
    aiAvatar,
    aiStatus,
    aiWelcomeTitle,
    aiWelcomeMessage,
    aiPlaceholder,
    aiEmptyChatMessage,
    aiTypingIndicatorText,
    aiThemeColor,
    aiAccentColor,
    aiBubbleStyle,
    aiTypingSpeed,
    aiResponseDelay,
    aiTypingAnimationEnabled,
    aiSuggestedQuestions,
    aiSearchPriority,
  } = req.body;
  await row.update({
    ...(name !== undefined && { name }),
    ...(email !== undefined && { email }),
    ...(phone !== undefined && { phone }),
    ...(role !== undefined && { role }),
    ...(address !== undefined && { address }),
    ...(experience !== undefined && { experience }),
    ...(languages !== undefined && { languages }),
    ...(careerObjective !== undefined && { careerObjective }),
    ...(currentFocus !== undefined && {
      currentFocus: typeof currentFocus === "string" ? JSON.parse(currentFocus) : currentFocus,
    }),
    ...(aboutContent !== undefined && {
      aboutContent: typeof aboutContent === "string" ? JSON.parse(aboutContent) : aboutContent,
    }),
    ...(socialLinks !== undefined && {
      socialLinks: typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks,
    }),
    ...(stats !== undefined && {
      stats: typeof stats === "string" ? JSON.parse(stats) : stats,
    }),
    ...(githubUsername !== undefined && { githubUsername: githubUsername || null }),
    ...(maintenanceMode !== undefined && { maintenanceMode: !!maintenanceMode }),
    ...(maintenanceMessage !== undefined && { maintenanceMessage }),
    ...(maintenanceEndsAt !== undefined && { maintenanceEndsAt: maintenanceEndsAt || null }),
    ...(maintenanceSplineUrl !== undefined && { maintenanceSplineUrl: maintenanceSplineUrl || null }),
    ...(aiEnabled !== undefined && { aiEnabled: !!aiEnabled }),
    ...(aiName !== undefined && { aiName }),
    ...(aiAvatar !== undefined && { aiAvatar }),
    ...(aiStatus !== undefined && { aiStatus }),
    ...(aiWelcomeTitle !== undefined && { aiWelcomeTitle }),
    ...(aiWelcomeMessage !== undefined && { aiWelcomeMessage }),
    ...(aiPlaceholder !== undefined && { aiPlaceholder }),
    ...(aiEmptyChatMessage !== undefined && { aiEmptyChatMessage }),
    ...(aiTypingIndicatorText !== undefined && { aiTypingIndicatorText }),
    ...(aiThemeColor !== undefined && { aiThemeColor }),
    ...(aiAccentColor !== undefined && { aiAccentColor }),
    ...(aiBubbleStyle !== undefined && { aiBubbleStyle }),
    ...(aiTypingSpeed !== undefined && { aiTypingSpeed }),
    ...(aiResponseDelay !== undefined && {
      aiResponseDelay: typeof aiResponseDelay === "string" ? parseInt(aiResponseDelay, 10) || 0 : aiResponseDelay,
    }),
    ...(aiTypingAnimationEnabled !== undefined && { aiTypingAnimationEnabled: !!aiTypingAnimationEnabled }),
    ...(aiSuggestedQuestions !== undefined && {
      aiSuggestedQuestions:
        typeof aiSuggestedQuestions === "string" ? JSON.parse(aiSuggestedQuestions) : aiSuggestedQuestions,
    }),
    ...(aiSearchPriority !== undefined && {
      aiSearchPriority: typeof aiSearchPriority === "string" ? JSON.parse(aiSearchPriority) : aiSearchPriority,
    }),
  });
  ok(res, row);
});

// Updates the logged-in admin's own name/email/phone/avatar (Settings tab in the UI).
const updateProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findByPk(req.adminId);
  if (!admin) throw new ApiError(404, "Admin not found.");

  const { name, email, phone } = req.body;
  if (name !== undefined) admin.name = name;
  if (email !== undefined) admin.email = email;
  if (phone !== undefined) admin.phone = phone;
  if (req.file) admin.avatar = `/uploads/${req.file.filename}`;
  await admin.save();

  ok(res, {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    avatar: admin.avatar,
    role: admin.role,
  });
});

// Generic single-file uploader for the "Logo / Favicon / Resume" settings tab.
const uploadAsset = asyncHandler(async (req, res) => {
  const { field } = req.params;
  if (!ALLOWED_ASSET_FIELDS.has(field)) throw new ApiError(400, "Unknown asset field.");

  // upload.any() puts every file on req.files; the frontend appends it under
  // a key matching :field (e.g. "logo"), so find that one specifically.
  const file = (req.files || []).find((f) => f.fieldname === field) || req.files?.[0];
  if (!file) throw new ApiError(400, "No file uploaded.");

  const row = await getSingleton();
  await row.update({ [field]: `/uploads/${file.filename}` });
  ok(res, row);
});

module.exports = { get, update, updateProfile, uploadAsset };
