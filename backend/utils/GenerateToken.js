import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "araut@12";

const generateToken = (res, user) => {
  const payload = {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "72h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict",
    maxAge: 3600000,
  });
};

export default generateToken;