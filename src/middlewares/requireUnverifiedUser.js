export const requireUnverifiedUser = (req, res, next) => {
  const user = req.user;

  if (!user || user.is_verified) {
    return res.status(403).json({
      success: false,
      error: "Your account is already verified."
    });
  }

  next();
};
