import Users from "../models/UserModel.js";
import Widraw from "../models/WithdrawalModel.js";
import Rechge from "../models/RechargeModel.js";
import Tasks from "../models/TasksModel.js";
import ora from 'ora';
import History from "../models/HistoryModel.js";

// Withdrawals History ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 export const WithdrawalsHistory = async(req, res) => {
    try {
        
        const load = ora({
          color: 'green',
          hideCursor: true
        }).start();
        const { userId, username} = req.body;
        const wthistory = await Widraw.findAll({
           where:{
                username: username
            },
           attributes:['id','amount','status','updatedAt']
          });
        res.json(wthistory);
    } catch (error) {
        console.log(error);
        res.status(400).json({msg: "Operation Failed"});
    }
}

// Recharges History ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 export const RechargesHistory = async(req, res) => {
    try {

        const load = ora({
          color: 'green',
          hideCursor: true
        }).start();
        const { userId, username} = req.body;
        const rghistory = await Rechge.findAll({
           where:{
                username: username
            },
           attributes:['id','amount','status','updatedAt']
          });
        res.json(rghistory);
    } catch (error) {
        console.log(error);
        res.status(400).json({msg: "Operation Failed"});
    }
}

// Tasks History ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 export const TasksHistory = async(req, res) => {
    try {
        
        const load = ora({
          color: 'green',
          hideCursor: true
        }).start();
        const { userId, username} = req.body;
        const tkhistory = await Tasks.findAll({
           where:{
                username: username
            },
           attributes:['id','amountTask','status','updatedAt']
          });
        res.json(tkhistory);
    } catch (error) {
        console.log(error);
        res.status(400).json({msg: "Operation Failed"});
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getAllHistory = async (req, res) => {
  try {

    const all_history = await History.findAll({
      where: {
        userId: req.params.id
      }
    }).then().catch(err => {
      console.log(err);
    });
    res.status(200).json({ all_history: all_history, msg: "Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
}

