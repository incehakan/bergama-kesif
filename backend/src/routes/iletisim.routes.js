const { Router } = require("express");
const ctrl = require("../controllers/iletisim.controller");

const publicRouter = Router({ mergeParams: true });
publicRouter.get("/", ctrl.publicGet);

const adminRouter = Router();
adminRouter.get("/", ctrl.adminGet);
adminRouter.put("/", ctrl.adminPut);

module.exports = { publicRouter, adminRouter };
