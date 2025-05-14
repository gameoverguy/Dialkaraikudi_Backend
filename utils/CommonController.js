exports.logout = (req, res) => {
  try {
    res.clearCookie("userToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.clearCookie("businessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ success: true, message: "Logged out manually." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed." });
  }
};
