const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

/**
 * Wires the standard list/getOne/create/update/remove handlers onto a
 * router, all behind requireAuth (these are admin-only management routes;
 * public read access is served separately by publicRoutes.js).
 *
 * @param {object} controller - { list, getOne, create, update, remove }
 * @param {string[]} uploadFields - fieldnames multer should accept as files (e.g. ["image"])
 */
function buildCrudRouter(controller, uploadFields = []) {
  const router = express.Router();
  const fileMiddleware = uploadFields.length
    ? upload.fields(uploadFields.map((name) => ({ name, maxCount: 1 })))
    : (req, res, next) => next();

  router.use(requireAuth);
  router.get("/", controller.list);
  router.get("/:id", controller.getOne);
  router.post("/", fileMiddleware, controller.create);
  router.put("/:id", fileMiddleware, controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

module.exports = buildCrudRouter;
