const { Router } = require("express");
const ctrl = require("../controllers/harita.controller");

const publicRouter = Router({ mergeParams: true });
publicRouter.get("/", ctrl.publicList);

module.exports = { publicRouter };
