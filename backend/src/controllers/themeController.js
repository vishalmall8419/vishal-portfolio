const { Theme } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");

const getSingleton = async () => {
  const [row] = await Theme.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
  return row;
};

const get = asyncHandler(async (req, res) => {
  const row = await getSingleton();
  ok(res, row);
});

const update = asyncHandler(async (req, res) => {
  const row = await getSingleton();
  const { mode, primaryColor, secondaryColor, accentColor, fontFamily, animationsEnabled } = req.body;
  await row.update({
    ...(mode !== undefined && { mode }),
    ...(primaryColor !== undefined && { primaryColor }),
    ...(secondaryColor !== undefined && { secondaryColor }),
    ...(accentColor !== undefined && { accentColor }),
    ...(fontFamily !== undefined && { fontFamily }),
    ...(animationsEnabled !== undefined && { animationsEnabled: animationsEnabled === true || animationsEnabled === "true" }),
  });
  ok(res, row);
});

module.exports = { get, update };
