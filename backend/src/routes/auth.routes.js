const { Router } = require("express");
const auth = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = Router();

router.post("/login", auth.login);
router.get("/me", authMiddleware, auth.me);

module.exports = router;
