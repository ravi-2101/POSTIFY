const User = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const userRegistration = async (req, res, next) => {
  try {
    // get data
    const { userName, fullName, email, phone, password, confirmPassword, DOB } =
      req.body;
    let profile;
    if (req?.file?.filename) {
      profile = req?.file?.filename;
    }

   

    // find existing user
    const finduser = await User.findOne({ userName });

    if (finduser) {
      return res
        .status(400)
        .json({ status: false, message: "Username already exists!" });
    }

    // password hash and compare passsword
    const hashpassword = await bcrypt.hash(password, 10);

    if (!confirmPassword) {
      return res
        .status(404)
        .json({ status: false, message: "confirm Password is required!" });
    }

    const comparepassword = await bcrypt.compare(confirmPassword, hashpassword);

    if (!comparepassword) {
      return res
        .status(404)
        .json({ status: false, message: "Password must be same!" });
    }

    // create user
    const userData = {
      userName,
      fullName,
      password: hashpassword,
      profile,
      DOB,
    };

    // Add email or phone if present
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    // Save user to the database
    const user = await User.create(userData);

    // response
    return res.status(201).json({
      status: true,
      data: user,
      message: "User registered successfully!",
    });
  } catch (error) {
    return res.status(500).json({ sttaus: false, message: error.message });
  }
};


const userLogin = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;


    // if (!email && !phone) {
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Either email or phone is required" });
    // }

    // const user = await User.findOne({
    //   $or : [{email}, {phone}]
    // })
    const user = await User.findOne({ email }).select("email phone password");
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User not found!" });
    }

    const comparepassword = await bcrypt.compare(password, user.password);
    if (!comparepassword) {
      return res
        .status(400)
        .json({ status: false, message: "Password is incorrect!" });
    }

    const token = await jwt.sign(
      {
        _id: user?._id,
        userName: user?.userName,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const tokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    user.token = token;
    user.tokenExpiresAt = tokenExpiresAt;
    await user.save();

    return res.status(200).json({
      status: true,
      token,
      tokenExpiresAt,
      data: {
        userId: user._id,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
      },
      message: "user login successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.find().select("-password -token -tokenExpiresAt");

    return res.status(200).json({
      sttaus: true,
      data: user,
      message: "User retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  userRegistration,
  userLogin,
  getUser,
};
