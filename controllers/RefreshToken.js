import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  console.log(
    "🚀 ~ file: RefreshToken.js:5 ~ refreshToken ~ req:",
    req.cookies
  );
  try {
    // const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ4LCJ1c2VybmFtZSI6ImRldiIsImVtYWlsIjoiZGV2QGRldi5jb20iLCJpYXQiOjE2OTUyNzU3OTYsImV4cCI6MTY5NTI3NTgxNn0.aEdABXoszY477xKNwlfdIS44639kD1Wbm_rDtbRwPRM';
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
        const userId = user[0].id;
        const username = user[0].username;
        const first_name = user[0].first_name;
        const last_name = user[0].last_name;
        const mobile = user[0].mobile;
        const user_code = user[0].user_code;
        const ref_code = user[0].ref_code;
        const address = user[0].address;
        const balance = user[0].balance;
        const vip = user[0].vip;
        const daily = user[0].daily;
        const nic = user[0].nicNo;
        const email = user[0].email;
        const wallet = user[0].wallet;
        const createdAt = user[0].createdAt;


        const accessToken = jwt.sign(
          {
            userId,
            username,
            first_name,
            last_name,
            mobile,
            email,
            balance,
            address,
            vip,
            ref_code,
            user_code,
            daily,
            wallet,nic,createdAt
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
