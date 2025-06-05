export const requireVerifiedUser = (req, res, next) => {
  try {
    const user = req.user;

    if (!user || !user.is_verified) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Email not verified."
      });
    }

    next();
  } catch (error) {
    console.error("Verification check failed:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong while checking verification."
    });
  }
};
