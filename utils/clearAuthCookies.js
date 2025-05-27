const clearAuthCookies = (
  res,
  tokens = ["userToken", "businessToken", "adminToken"]
) => {
  tokens.forEach((tokenName) => {
    res.clearCookie(tokenName, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/", // optional, but helps ensure it matches the original
    });
  });
};

module.exports = clearAuthCookies;
