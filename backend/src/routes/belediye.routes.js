const { Router } = require("express");
const ctrl = require("../controllers/belediye.controller");

const router = Router();

router.get("/", ctrl.getMyBelediye);

module.exports = router;
