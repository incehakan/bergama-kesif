const { Router } = require("express");
const ctrl = require("../controllers/etkinlikler.controller");

const publicRouter = Router({ mergeParams: true });
publicRouter.get("/", ctrl.publicList);

const adminRouter = Router();
adminRouter.get("/", ctrl.adminList);
adminRouter.post("/", ctrl.adminCreate);
adminRouter.put("/:id", ctrl.adminUpdate);
adminRouter.delete("/:id", ctrl.adminDelete);

module.exports = { publicRouter, adminRouter };
