const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userService = require("../services/userService");
const validateRequest = require("../middleware/validationMiddleware");
const { userRegistrationSchema, userLoginSchema } = require("../middleware/validators");

// REGISTER
router.post("/register", validateRequest(userRegistrationSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await userService.registerUser(
      name,
      email,
      password
    );

    res.status(201).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
});

// LOGIN
router.post("/login", validateRequest(userLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await userService.loginUser(email, password);

    res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
});

// PROFILE
router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);

    res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    next(error);
  }
});

// UPDATE PROFILE
router.put("/profile", authMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);

    res.json({
      success: true,
      data: updatedUser,
    });

  } catch (error) {
    next(error);
  }
});

// DELETE PROFILE
router.delete("/profile", authMiddleware, async (req, res, next) => {
  try {
    await userService.deleteUserProfile(req.user.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;