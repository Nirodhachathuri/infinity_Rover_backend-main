import Users from "../models/UserModel.js";
import ora from 'ora';

export const Team = async (req, res) => {
  try {
    const load = ora({
      color: 'green',
      hideCursor: true
    }).start();

    const { userId, ref_code } = req.body;
    const user_code = 'IR_00015'
    // user and theire referrals
    const user = await Users.findOne({
      where: {
        user_code: user_code,
      },
      attributes: ['id', 'username', 'position']
    });

    // check user eligible for IR
    if (user && (user.position === 'left' || user.position === 'right')) {
      const leftSideReferrals = await Users.findAll({
        where: {
          ref_code: user_code,
          position: 'left'
        },
        attributes: ['id', 'balance']
      });

      const rightSideReferrals = await Users.findAll({
        where: {
          ref_code: user_code,
          position: 'right'
        },
        attributes: ['id', 'balance']
      });

      // check both side
      const leftSideBV = leftSideReferrals.reduce((totalBV, referral) => totalBV + (referral.balance || 0), 0);
      const rightSideBV = rightSideReferrals.reduce((totalBV, referral) => totalBV + (referral.balance || 0), 0);

      //convert rate USDT to BV

      if (leftSideBV * 5 >= 20 && rightSideBV * 5 >= 20) {
        // if user eligible for IR
        const irAllowanceAmount = 7;
        const payment = Math.min(leftSideBV, rightSideBV) / 20 * irAllowanceAmount;

        load.stop();

        res.json({
          eligible: true,
          payment: payment
        });
        return;
      }
    }

    load.stop();

    // Not eligible for IR
    res.json({
      eligible: false,
      payment: 0
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
