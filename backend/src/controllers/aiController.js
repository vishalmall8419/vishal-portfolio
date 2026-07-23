const { Settings } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { ok } = require("../utils/apiResponse");
const aiKnowledgeService = require("../services/aiKnowledgeService");

// Public: widget config -- whether it's enabled, name/avatar/welcome
// message/suggested questions, all admin-editable.
const config = asyncHandler(async (req, res) => {
  const [settingsRow] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  ok(res, {
    enabled: !!settingsRow.aiEnabled,
    name: settingsRow.aiName,
    avatar: settingsRow.aiAvatar,
    status: settingsRow.aiStatus,
    welcomeTitle: settingsRow.aiWelcomeTitle,
    welcomeMessage: settingsRow.aiWelcomeMessage,
    placeholder: settingsRow.aiPlaceholder,
    emptyChatMessage: settingsRow.aiEmptyChatMessage,
    typingIndicatorText: settingsRow.aiTypingIndicatorText,
    themeColor: settingsRow.aiThemeColor,
    accentColor: settingsRow.aiAccentColor,
    bubbleStyle: settingsRow.aiBubbleStyle,
    typingSpeed: settingsRow.aiTypingSpeed,
    responseDelay: settingsRow.aiResponseDelay,
    typingAnimationEnabled: settingsRow.aiTypingAnimationEnabled !== false,
    suggestedQuestions: settingsRow.aiSuggestedQuestions || [],
  });
});

const ask = asyncHandler(async (req, res) => {
  const [settingsRow] = await Settings.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  if (!settingsRow.aiEnabled) {
    throw new ApiError(403, "The AI assistant is currently disabled.");
  }

  const { question } = req.body;
  if (!question || !String(question).trim()) {
    throw new ApiError(400, "Please ask a question.");
  }
  if (String(question).length > 500) {
    throw new ApiError(400, "That question is a bit long — please keep it under 500 characters.");
  }

  const result = await aiKnowledgeService.ask(question);
  ok(res, result);
});

module.exports = { config, ask };
