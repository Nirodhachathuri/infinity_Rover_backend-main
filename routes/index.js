import express from "express";
import { upload, Register, Login, Logout, SetPosition, GetIntroducerSet, GetNewCommerSet, GetIrAllowance,updateWallet, ApproveKYCForUser, GetNewRegistrations, GetBannedUsers,GetIrFamily ,GetAllUsers,GetIrAllowance1} from "../controllers/Users.js";
import {
  GetTodayWithdrawalDetails,
  GetTodayWithdrawalsCount,
  GetTotalWithdrawn,
  Withdraw
} from "../controllers/Withdraw.js";
import { GetTodayDepositDetails, GetTodayDepositsCount, Recharge } from "../controllers/Recharge.js";
import {
  WithdrawalsHistory,
  RechargesHistory,
  TasksHistory,
  getAllHistory,
} from "../controllers/History.js";
import { levelOne, levelTwo, levelPremium } from "../controllers/Vip.js";
import { Task } from "../controllers/Tasks.js";
import { Team } from "../controllers/Referrals.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import { SetAddress } from "../controllers/Utils.js";
import {
  AddPackage,
  BuyPackage,
  GetAllPackages,
  GetPackagesByUser,
} from "../controllers/Package.js";
import { ChangeStatus, GetAdminControls, GetControls, UpdateAdminControls } from "../controllers/ControlPanel.js";

const router = express.Router();

router.get('/users', verifyToken);
router.get('/token', refreshToken);
router.post('/levelOne', levelOne);
router.post('/levelTwo', levelTwo);
router.post('/levelPremium', levelPremium);
router.post('/address', SetAddress);
router.post('/register',upload.array("images", 5), Register);
router.post('/login', Login);
router.post('/withdraw', Withdraw);
router.post('/recharge', Recharge);
router.post('/tasks', Task);
router.all('/withdraw/history', WithdrawalsHistory);
router.all('/recharge/history', RechargesHistory);
router.all('/tasks/history', TasksHistory);
router.all('/team', Team);
router.delete('/logout', Logout);
router.put('/setposition', SetPosition); // should be provide user_id, position, loged_user_id as a body data
router.get('/introducer/get/:ref_code', GetIntroducerSet); // should be provide ref_code of loged user as on params 
router.post('/addpackage', AddPackage); // should be provide packageName:string, packageValue:float
router.post('/buypackage', BuyPackage); // should be provide packageId:int, userId:int
router.get('/getpackages/:id', GetPackagesByUser);// should be user id as a param data
router.get('/getallpackages', GetAllPackages);// should be user id as a param data
router.get('/getcontrols', GetControls);// should be user id as a param data
router.put('/changeStatus', ChangeStatus);// should be user id as a param data
router.get('/gethistory/:id', getAllHistory); // should be user id as a param data
router.get('/newcommer/get/:user_code', GetNewCommerSet); // should be provide ref_code of loged user as on params 
router.get('/getIrFamily/get/:user_code', GetIrFamily); // should be provide ref_code of loged user as on params 
router.get('/irallowance/:user_code', GetIrAllowance); // should be provide ref_code of loged user as on params 
router.put('/updateWallet', updateWallet); // should be provide ref_code of loged user as on params 
router.put('/kyc/approve', ApproveKYCForUser); // should be provide userId and approved data  as on bodydata
router.get('/withdraw/todaycount', GetTodayWithdrawalsCount); 
router.get('/withdraw/todaydetails', GetTodayWithdrawalDetails); 
router.get('/withdraw/total/:userId', GetTotalWithdrawn);
router.get('/recharge/todaycount', GetTodayDepositsCount);
router.get('/recharge/todaydetails', GetTodayDepositDetails); 
router.get('/users/newregistrations', GetNewRegistrations); 
router.get('/users/bannedusers', GetBannedUsers); 
router.get('/systemcontrols', GetAdminControls);
router.put('/systemcontrols/update', UpdateAdminControls);
router.get('/GetAllUsers', GetAllUsers);
router.get('/GetIrAllowance1/:id', GetIrAllowance1);

export default router;
