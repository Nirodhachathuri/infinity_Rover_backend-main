import BuyPackages from "../models/BuyPackageModel.js";
import Packages from "../models/PackageModel.js";
import Users from "../models/UserModel.js";

export const AddPackage = async (req, res) => {
  try {
    await Packages.create({
      packageName: req.body.packageName,
      packageValue: req.body.packageValue,
      buyCount: 0,
    });
    res.status(200).json({ msg: "Register Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};

export const BuyPackage = async (req, res) => {
  try {
    // const packages_r = await Packages.findAll({
    //     where: {
    //         userId: req.body.userId
    //     }
    // });

    // if (packages_r.length > 3) {
    //     return res.status(401).json({ msg: "Package buy limit exceeded" });
    // }

    const current_package = await Packages.findOne({
      where: {
        id: req.body.packageId,
      },
    });

    await BuyPackages.create({
      packageId: req.body.packageId,
      userId: req.body.userId,
    });

    const user = await Users.findOne({
      where: {
        id: req.body.userId,
      },
    });

    if (user.wallet < current_package.packageValue) {
      return res.status(404).json({ msg: "not enough balance!" });
    }

    await Users.update(
      {
        balance: user.balance + (current_package.packageValue * 7) / 100,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const user2 = await Users.findOne({
      where: {
        user_code: user.ref_code,
      },
    });

    await Users.update(
      {
        balance: user2.balance + (current_package.packageValue * 3) / 100,
      },
      {
        where: {
          id: user2.id,
        },
      }
    );

    await Users.update(
      {
        wallet: user.wallet - current_package.packageValue,
      },
      {
        where: {
          id: req.body.userId,
        },
      }
    );

    await Packages.update(
      {
        buyCount: current_package.buyCount + 1,
      },
      {
        where: {
          id: req.body.packageId,
        },
      }
    );

    res.status(200).json({ msg: "Buy package Success" });
  } catch (error) {
    console.error(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};

export const GetPackagesByUser = async (req, res) => {
  try {
    const all_packages = await BuyPackages.findAll({
      where: {
        userId: req.params.id,
      },
    })
      .then()
      .catch((err) => {
        console.log(err);
      });
    res.status(200).json({ packages: all_packages, msg: "Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};
export const GetAllByPackages = async (req, res) => {
  try {
    const all_packages = await BuyPackages.findAll({})
      .then()
      .catch((err) => {
        console.log(err);
      });
    res.status(200).json({ packages: all_packages, msg: "Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};

export const GetAllPackages = async (req, res) => {
  try {
    const all_packages = await Packages.findAll()
      .then()
      .catch((err) => {
        console.log(err);
      });
    res.status(200).json({ packages: all_packages, msg: "Success" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "Operation Failed!" });
  }
};
