import jwt from "jsonwebtoken"
import User from "../models/User.js"

const authantication = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token; //user ka token liya

  if (!token) return res.status(404).json({ message: "No token fount" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //token verify kya
    console.log("DECODED TOKEN:", decoded); // 👈 Does it have role: 'admin'?
    if(decoded){
      const findUser = await User.findById(decoded.id) //verify k bd usi token ka user dhunda k wo hay ya deleted hay
         console.log("USER FROM DB:", findUser?.role); // 👈 What role is saved in DB?
      if (findUser == null) {
        return res.json({
          status: false,
          message: "user not valid",
        });
      }
    req.user = findUser; // next pr jo controller hay uski reg me user property add krdo (req.body,req.params,req.user---->(userdata))
    next();
  }
 else {
     return res.json({
        status: false,
        message: "invalid token",
      });
    }} catch (err){
    res.status(500).json({ message: err.message});
  }
};

export default authantication