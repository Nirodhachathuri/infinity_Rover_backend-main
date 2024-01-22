import Users from "../models/UserModel.js";
import referralCodes from "referral-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ora from "ora";
import History from "../models/HistoryModel.js";
import { Sequelize } from "sequelize";
import twilio from "twilio";
import dotenv from 'dotenv';
import path from "path";

// ################ IMAGE UPLOAD
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../', 'uploads'),
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });
// ################ IMAGE UPLOAD

dotenv.config();
const { Op,literal } = Sequelize;
// import { Op, literal } from 'sequelize';


//Configure Twillio
const client = twilio(
    // "Account SID",
    // "Auth Token",
    process.env.TWILIO_CLIENT_SID,
    process.env.TWILIO_CLIENT_AUTH_TOKEN
);

//Genarate random six-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

//send otp using twillio
const sendOtpToPhoneNumber = async (phoneNumber, otpCode) => {
  try {
    await client.messages.create({
      body: `Your registration OTP is: ${otpCode}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log("OTP sent successfully.");
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw error;
  }
};



export const Register = async (req, res) => {

  console.log("handleImageUpload request >> ", req.body)
  // if (!req.files) {
  //   return res.status(400).json({ error: 'No file uploaded.' });
  // }
  //
  // const fileDetails = req.files.map((file) => ({
  //   filename: file.filename,
  //   // originalname: file.originalname,
  //   // destination: file.destination,
  //   // path: file.path,
  // }));

  // You can handle the file data or send a response to the client
  // res.json({ message: 'File uploaded successfully!', fileDetails });



  const load = ora({
    color: "green",
    hideCursor: true,
  }).start();
  // const idImagePath = req.file.path;
  const { password, confPassword } = req.body;
  const balance = 0;
  const verifyUsername = await Users.findOne({
    where: { username: req.body.username },
  });
  if (verifyUsername) {
    res.status(400).json({ msg: "Username Already Registered" });
  } else {
    // const verifyEmail = await Users.findOne({
    //   where: { email: req.body.email },
    // });
    // if (verifyEmail) {
    //   res.status(400).json({ msg: "Email Already Registered" });
    // } else {
      if (password !== confPassword)
        return res
            .status(400)
            .json({ isAlert: "error", msg: "Check Password" });
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      const verifyCode = await Users.findOne({
        where: { user_code: req.body.ref_code },
      });
      if (!verifyCode) {
        res.status(400).json({ msg: "Invitation Code Error" });
      } else {
        const lastUserId = (await Users.max("id")) || 0;

        const user_code = `IR${String(lastUserId + 1).padStart(5, "0")}`;


        try {
          await Users.create({
            username: req.body.username,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            mobile: req.body.mobile,
            email: req.body.email,
            password: hashPassword,
            balance: balance,
            user_code: user_code,
            ref_code: req.body.ref_code,
            wallet:500000,
            ipv4: req.body.ipv4,
            // nicImage: fileDetails.map((file) => file.filename).join('</>'),
            nicNo: req.body.nic,
          });
          res.status(200).json({ msg: "Register Success", otpSent:true });
        } catch (error) {
          console.log(error);
          res.status(404).json({ msg: "Operation Failed!" });
        }
      }
    // }
  }

};

export const Login = async (req, res) => {
  try {
    const load = ora({
      color: "green",
      hideCursor: true,
    }).start();
    const user = await Users.findAll({
      where: {
        username: req.body.email,
      },
    });
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match)
      return res.status(400).json({ isAlert: "error", msg: "Wrong Password" });
    const userId = user[0].id;
    const username = user[0].username;
    const email = user[0].email;
    const accessToken = jwt.sign(
        { userId, username, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "20s",
        }
    );
    const refreshToken = jwt.sign(
        { userId, username, email },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
    );
    await Users.update(
        { refresh_token: refreshToken, ipv4: req.body.ipv4 },
        {
          where: {
            id: userId,
          },
        }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None", domain: null,
    });
    return res.status(200).json({ accessToken, msg: "Login Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ isAlert: "error", msg: "Account Error" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update(
      { refresh_token: null },
      {
        where: {
          id: userId,
        },
      }
  );
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};

export const SetPosition = async (req, res) => {
  const { user_id, position, loged_user_id } = req.body;

  const updateUserWithCommission = async (id, balance, lavel) => {
    var newBalance = 0;

    if (lavel == 1) {
      newBalance = balance + balance * 0.07;
    } else if (lavel == 2) {
      newBalance = balance + balance * 0.03;
    }
    await Users.update(
        { balance: newBalance },
        {
          where: {
            id: id,
          },
        }
    )
        .then(async () => {
          await History.create({
            userId: id,
            amount: newBalance,
            balanceIncreased: true,
            type: "commission",
          });
          //wollet update here

          return;
        })
        .catch((err) => {
          console.log(err);
        });
  };
  await Users.update(
      { position: position,isAssigned:true },
      {
        where: {
          id: user_id,
        },
      }
  )
      .then(async () => {
        Users.findOne({
          where: {
            id: loged_user_id,
          },
        })
            .then((logedUser) => {
              updateUserWithCommission(logedUser.id, logedUser.balance, 1);

              Users.findOne({
                where: {
                  user_code: logedUser.ref_code,
                },
              })
                  .then((refUser) => {
                    console.log("refUser",refUser);
                    if (refUser) {
                      updateUserWithCommission(refUser.id, refUser.balance, 2);
                      return res.status(200).json({ msg: "Update successfull" });
                    } else {
                      return res.status(200).json({ msg: "You have not upliner" });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
            })
            .catch((err) => {
              console.log(err);
            });
      })
      .catch((err) => {
        console.log(err);
      });
};
export const updateWallet = async (req, res) => {
  const { user_id, amount } = req.body;
  await Users.update(
      { wallet: amount },
      {
        where: {
          id: user_id,
        },
      }
  ).then(() => {
    return res.status(200).json({ msg: "Update successfull" });
  });
  const updateUserWithCommission = async (id, balance, lavel) => {
    var newBalance = 0;

    if (lavel == 1) {
      newBalance = balance + balance * 0.07;
    } else if (lavel == 2) {
      newBalance = balance + balance * 0.03;
    }
    await Users.update(
        { balance: newBalance },
        {
          where: {
            id: id,
          },
        }
    )
        .then(async () => {
          await History.create({
            userId: id,
            amount: newBalance,
            balanceIncreased: true,
            type: "commission",
          });
          //wollet update here

          return;
        })
        .catch((err) => {
          console.log(err);
        });
  };
  await Users.update(
      { position: position },
      {
        where: {
          id: user_id,
        },
      }
  )
      .then(async () => {
        Users.findOne({
          where: {
            id: loged_user_id,
          },
        })
            .then((logedUser) => {
              updateUserWithCommission(logedUser.id, logedUser.balance, 1);

              Users.findOne({
                where: {
                  user_code: logedUser.ref_code,
                },
              })
                  .then((refUser) => {
                    if (refUser) {
                      updateUserWithCommission(refUser.id, refUser.balance, 2);
                      return res.status(200).json({ msg: "Update successfull" });
                    } else {
                      return res.status(200).json({ msg: "You have not upliner" });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
            })
            .catch((err) => {
              console.log(err);
            });
      })
      .catch((err) => {
        console.log(err);
      });
};

export const GetIntroducerSet = async (req, res) => {
  await Users.findAll({
    where: {
      ref_code: req.params.ref_code,
    },
  })
      .then((refUser) => {
        if (refUser) {
          var rightSideArr = refUser.filter((obj) => obj.position == "right");
          var leftSideArr = refUser.filter((obj) => obj.position == "left");

          return res.status(200).json({
            data: { left: leftSideArr, right: rightSideArr },
            msg: "successfull",
          });
        } else {
          return res.status(200).json({ msg: "You have not Introducers" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
};


// 1/9/2024  12.51pm UpdateAllUsersOnceNight function edit by Rashin shan 
export const UpdateAllUsersOnceNight = async () => {
  const users = await Users.findAll()
      .catch((err) => {
        console.log(err);
      });

  users.forEach(async (user) => {
    // calculate users registration days to calculate profit 
    const registrationDate = user.createdAt;
    const currentDate = new Date();
    const daysSinceRegistration = Math.floor(
        (currentDate - registrationDate) / (24 * 60 * 60 * 1000)
    );

    // Check if more than 10 days have passed
    // and .getDay() will retern appropriatly day number of the week if 0 it is sunday if 6  suterday 
    if (daysSinceRegistration > 10 && daysSinceRegistration % 7 !== 0 && daysSinceRegistration <= 300 && currentDate.getDay() !== 0 && currentDate.getDay() !== 6    ) {
      var newBalance = user.balance * 1.01;

      await Users.update(
          { balance: newBalance },
          {
            where: {
              id: user.id,
            },
          }
      )
          .then(async () => {
            // Wllet data update part
            await History.create({
              userId: user.id,
              amount: newBalance - user.balance,
              balanceIncreased: true,
              type: "dailyprofit",
            });
          })
          .catch((err) => {
            console.log(err);
          });
    }
  });

  console.log("Updated balance of eligible users!");
  return;
};




export const GetNewCommerSet = async (req, res) => {
  await Users.findAll({
    where: {
      ref_code: req.params.user_code,
    },
    attributes: ["id", "username", "last_name", "createdAt","isAssigned"],
  })
      .then((refUser) => {
        if (refUser) {
          var newCommerArr = refUser.filter(
              (obj) => obj.position == "" || obj.position == null
          );
          return res.status(200).json({ data: newCommerArr, msg: "successfull" });
        } else {
          return res.status(200).json({ msg: "You have not Introducers" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
};
export const GetIrFamily = async (req, res) => {
  await Users.findAll({
    where: {
      ref_code: req.params.user_code,
    },
    attributes: [
      "id",
      "username",
      "last_name",
      "createdAt",
      "ref_code",
      "user_code",
      "position",
    ],
  })
      .then((refUser) => {
        if (refUser) {
          return res.status(200).json({ data: refUser, msg: "successfull" });
        } else {
          return res.status(200).json({ msg: "You have not Introducers" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
};
export const GetIrAllowance1 = async (req, res) => {
  //get ref users
  let userList = [];
    const getRefUsers = async (ref_code) => {
    const refUsersArr = await Users.findAll({
      where: {
        ref_code: ref_code,
      },
      attributes: ["id", "username", "user_code", "ref_code","position"],
    }).catch((err) => {
      return [];
    });
    if (refUsersArr) {
      return refUsersArr;
    }
  };

  const calculateFactorial = async (ref_code) => {
    const refUsersArr = await getRefUsers(ref_code);

    if (refUsersArr) {
      userList.push(refUsersArr);
    }
    for (let i=0; i<refUsersArr.length; i++) {
          await calculateFactorial(refUsersArr[i].user_code);
    }
    return userList;
  };

  await Users.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then(async (logedUser) => {
      if (logedUser) {

        const dataList = await calculateFactorial(logedUser.user_code);
        let flattenedArray = dataList.reduce((acc, sublist) => acc.concat(sublist), []);

        let data = flattenedArray.map(user => {
          return user.dataValues;
        });

        // Print mapedArr data to the terminal
        data.push({id:logedUser.id,username: logedUser.username,user_code:logedUser.user_code, ref_code:logedUser.ref_code ,position:logedUser.position})
        // Display the pyramid structure
        const mainArray = createNestedArray([],data,logedUser.ref_code);

        return res.status(200).json({ data: mainArray, msg: "successfull" });

      } else {
        return res.status(200).json({ msg: "You have not Introducers" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
// Print the tree in a pyramid structure
const createNestedArray = (mainArray, dataArray, parentId) => {
  const result = [];

  console.log("Processing parentId:", parentId);

  for (const dataItem of dataArray) {
    if (dataItem.ref_code === parentId) {
      const newItem = {
        id: dataItem.id,
        username: dataItem.username,
        user_code: dataItem.user_code,
        ref_code: dataItem.ref_code,
        label: dataItem.username,
        position: dataItem.position,
      };

      console.log("Adding newItem:", newItem);
      const children = createNestedArray(mainArray, dataArray, dataItem.user_code);
      if (children && children.length > 0) {
        newItem.children = [];

        const leftChildren = [];
        const rightChildren = [];

        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.position === 'left' && leftChildren.length < 2) {
            leftChildren.push(child);
          } else if (child.position === 'right' && rightChildren.length < 2) {
            rightChildren.push(child);
          } 
        }

        if (leftChildren.length > 0) {
          newItem.children.push({
            position: 'left',
            children: leftChildren,
          });
        }

        if (rightChildren.length > 0) {
          newItem.children.push({
            position: 'right',
            children: rightChildren,
          });
        }
      }

      result.push(newItem);
    }
  }
  return result;
};
// function printTree(node,level=0){
//   if (!node) {
//     return [];  // Return an empty array when the node is undefined
//   }
// console.log("node",node)
//   const result = [{
//     id: node.id,
//     username: node.username,
//     userCode: node.userCode,
//     refCode: node.refCode,
//     label: node.label,
//     position: node.position,
//     children: printTree(node.children[0], level + 1),
//   }];

//   if (node.children.length > 1) {
//     result[0].children.push(...printTree(node.children[1], level + 1));
//   }

//   return result;
// }

export const GetIrAllowance = async (req, res) => {
  let logedUserCode = req.params.user_code;

  const getRefUsers = async (ref_code) => {
    const refUsersArr = await Users.findAll({
      where: {
        ref_code: ref_code,
      },
      attributes: ["id", "username", "user_code", "ref_code"],
    }).catch((err) => {
      return [];
    });
    if (refUsersArr) {
      return refUsersArr;
    }
  };

  const fetchUserDataToArray = async (ref_code) => {
    const refUsersArr = await getRefUsers(ref_code);

    if (refUsersArr) {
      const userList = [...refUsersArr];

      const userDataPromises = userList.map((user) =>
          fetchUserDataToArray(user.user_code)
      );
      const userData = await Promise.all(userDataPromises);

      // Add the fetched user daa to the userList array
      userList.concat(userData);

      return userList;
    }

    return [];
  };

  let data = await fetchUserDataToArray(logedUserCode);

  return res.status(200).json({ data: data, msg: "successfull" });
};


////////////////////////////////////////////////////////////////////////
//kyc function edit by Rashin Shan 2024/10/1  4.56am
export const ApproveKYCForUser = async (req, res) => {
  console.log(req.body.userId);
  const { userId, approved, identificationType } = req.body;

  try {
    // check validity 
    const validIdentificationTypes = ['ID', 'Passport', 'Driving License'];
    if (!validIdentificationTypes.includes(identificationType)) {
      return res.status(400).json({ msg: "Invalid identification type" });
    }

    // Check Id is alrady approved
    const existingUser = await Users.findOne({
      where: {
        id: userId,
        kycApproved: true,
      },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "User already approved for KYC" });
    }

    // check id alrady approved if user input id
    if (identificationType === 'ID') {
      const existingIDUser = await Users.findOne({
        where: {
          identificationType: 'ID',
          identificationValue: userId,
          kycApproved: true,
        },
      });

      if (existingIDUser) {
        return res.status(400).json({ msg: "ID already used for KYC" });
      }
    }

    // Update  KYC approval status
    await Users.update(
        { kycApproved: approved },
        {
          where: {
            id: userId,
          },
        }
    );


    return res.status(200).json({ msg: "Successful KYC approval" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Operation Failed!" });
  }
};


///////////////////////////////////////////////////////////////////////////////////////

// import { Op } from 'sequelize';

export const GetNewRegistrations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight

    const users = await Users.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    return res.status(200).json({ newUsers: users, msg: "Successful" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};


export const GetAllUsers = async (req, res) => {
  try {
    // retrieve all users
    const users = await Users.findAll();

    // successful, send a JSON response and success message
    return res.status(200).json({ newUsers: users, msg: "successful" });
  } catch (error) {
    // if error  log the error send json responce 
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};


export const GetBannedUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      where: {
        acc_banned: true,
      },
    });
    return res.status(200).json({ bannedUsers: users, msg: "successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};
