import TronWeb from 'tronweb';
import ora from 'ora';
import Users from "../models/UserModel.js";
import Widraw from "../models/WithdrawalModel.js";
import History from '../models/HistoryModel.js';
import { Sequelize } from "sequelize";

const { Op } = Sequelize;

// Withdrawawls -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Sender: TN6E9UYjAkCDzFhHzYyhpTCHyLMpEXKJuz
// Receiver: TTCNmWtT7SUuzjFYQFFnXSuZUYwhuXGjKd

export const Withdraw = async (req, res) => {

    
    const load = ora({
      color: 'green',
      hideCursor: true
    }).start();
    const { amount, username, toAddress, balance, vip, userId } = req.body;
    const status = "Success";
    const fromAddress = process.env.FROM;
    const privateKey = process.env.TRON_PRIVATE_KEY;
    const AppKey = "Tron Grid API Key - Optional";
    const CONTRACT = process.env.CONTRACT;
    const network = "mainnet";
    const minimun = 2;
    const required = 1;
    let url = null 
  if (network === "shasta") {
    url = "https://api.shasta.trongrid.io";
  } else if (network === "nile") {
    url = "https://nile.trongrid.io";
  } else if (network === "mainnet") {
    url = "https://api.trongrid.io";
  }
  const isVip = await ( required <= vip );
     if(!isVip) return res.status(403).json({ msg: "Vip Level Required" });
  const can = await ( minimun <= amount );
     if(!can) return res.status(400).json({ msg: "Very Low Amount" });
  const match = await ( balance >= amount );
     if(!match) return res.status(401).json({ msg: "Insuficient Balance" });
     if(Math.round(amount) != amount) {
     res.status(400).json({ msg: "Only Number Integer"});
  } else {
 try {
  const tronWeb = new TronWeb({
    fullHost: url,
    headers: { "TRON-PRO-API-KEY": "fbbc2f4c-4b81-4dc0-8a56-e87a09e48724" },
    privateKey: privateKey,
  });

  const options = {
    feeLimit: 10000000,
    callValue: 0
  };
  
  const haveBalance = await tronWeb.trx.getAccount('TWLJXhRP9ZpE75wZ5pe4RKHpQdxG9KxnXu'); 
  console.log(haveBalance);
  const tx = await tronWeb.transactionBuilder.triggerSmartContract(
    CONTRACT, 'transfer(address,uint256)', options,
    [{
      type: 'address',
      value: toAddress
    }, {
      type: 'uint256',
      value: amount * 1000000
    }],
    tronWeb.address.toHex(fromAddress)
   );
   console.log("Making a Withdrawal...");

   const signedTx = await tronWeb.trx.sign(tx.transaction);
   const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx);
   //return broadcastTx;
   load.succeed("Success Operation!");
         await Widraw.create({
             username: username,
             to: toAddress,
             amount: amount,
             status: status
          });
          await History.create({
            userId: userId,
            amount: amount,
            balanceIncreased: false,
            type:"withdraw"
          });
      console.log("Saving Transaction...");
      const updateBalance = await( balance - parseInt(amount) );
          await Users.update({balance: updateBalance},{
           where:{
              id: userId
           }
         });

         load.succeed("Done!");
         return res.status(200).json({ msg: "Success Operation" });
           } catch (error) {
            console.log(error);
            res.status(400).json({ msg:"Operation Failed" });
        }
   }
}

export const GetTodayWithdrawalsCount = async (req, res) => {

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight

    // Count the withdrawals with a timestamp for today
    const count = await Widraw.count({
      where: {
        updatedAt: {
          [Op.gte]: today,
        },
      },
    });
    return res.status(200).json({count :count,  msg: "successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
  
};

export const GetTodayWithdrawalDetails = async (req, res) => {

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight

    // Count the withdrawals with a timestamp for today
    const withdrawals = await Widraw.findAll({
      where: {
        updatedAt: {
          [Op.gte]: today,
        },
      },
    });
    return res.status(200).json({withdrawals :withdrawals,  msg: "successfull" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
  
};


export const GetTotalWithdrawn = async (req, res) => {
  try {
    // Calculate the total amount withdrawn
    const total = await Widraw.sum('amount', {

    });
    return res.status(200).json({ total: total, msg: "Successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Operation Failed!" });
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
