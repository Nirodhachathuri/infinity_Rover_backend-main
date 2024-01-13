import ControlPanel from "../models/ControlPanel.js";
import Control from "../models/ControllerModel.js";


export const ChangeStatus = async (req, res) => {
  try {
    await Control.update(
      {
        status: req.body.status,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ msg: "Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};

export const GetControls = async (req, res) => {
  try {
    const controls = await Control.findAll({})
      .then()
      .catch((err) => {
        console.log(err);
      });
    res.status(200).json({ controls: controls, msg: "Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};

export const GetAdminControls = async (req, res) => {
  try {
     await ControlPanel.findOne({
      where: {
        id: 1,
      },
      attributes: [ "make_deposits","make_withdrawals","packages_purchase"],
    })
      .then(
        (responce)=>{
          return res.status(200).json({ controls: responce, msg: "Success" });
        }
      )
      .catch((err) => {
        console.log(err);
      });
    
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};

export const UpdateAdminControls = async (req, res) => {
  const { make_deposits, make_withdrawals, packages_purchase } = req.body

  await ControlPanel.update({
    make_deposits: make_withdrawals,
    make_withdrawals: make_deposits,
    packages_purchase: packages_purchase
  },
    {
      where: {
        id: 1,
      },
    })
    .then(
      () => {
        return res.status(200).json({ msg: "Success" });
      }
    )
    .catch((err) => {
      res.status(404).json({ msg: "Operation Failed!" });
    });
};
