import jwt from "jsonwebtoken";
import Users from "../models/User.js";

const adminMiddlware = (req, res, next) => {
  if (!req.user) {
    return res.json({
      status: false,
      message: "user not found login again",
    });
  }
console.log("REQ.USER ROLE:", req.user?.role); // 👈 What is being checked?
  if(req.user.role !== 'admin'){
       return res.status(400).json({
      status: false,
      message: "access denied Admin only",
    });
  }
  next()
};

const userMiddlware = async (req, res, next) => {
  try {
    const token =
      req.headers?.authorization?.split(" ")[1] || req.cookies.token;
    if (!token) {
     return  res.json({
        status: false,
        message: "token not found",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.id);
    const findUser = await Users.findById(decoded.id);
    console.log("finduser--->", findUser);
    if (findUser) {
      req.user = findUser;
      next();
    }

    // else{
    //     res.json({
    //         status:false,
    //         message:'invalid token'
    //     })
    // }
    //   console.log(decoded.id == id);
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
};

export { userMiddlware, adminMiddlware };
