const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const twilio = require('twilio');


const User = require('../Model/UserSchema'); // import UserSchema

require('dotenv').config();

const accountID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
//const verificationSID = process.env.VERIFICATION_SID;

const client = twilio(accountID, authToken);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lekhanh98777@gmail.com',
    pass: 'qjhdzueolgabesic'
  }
})

const generateOTP = () => {
  return crypto.randomInt(1000, 9999).toString();
}

// @ts-ignore
const sendOTPbySMS = async (otp, phoneNumber) => {
  try{
    await client.messages.create({
      body: `your OTP code is ${otp}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    })
  }
  catch(err){
    console.error("lỗi gửi OTP qua SMS", err);
  }
}

// @ts-ignore
const sendOTPbyEmail = async (otp, email) => {
  try{
    await transporter.sendMail({
      from: 'lekhanh98777@gmail.com',
      to: email,
      subject: 'MOODY BLUE Authentication OTP',
      text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`
    });
  }
  catch(err){
    console.error("lỗi gửi OTP qua SMS", err);
  }
}

// @ts-ignore
exports.getAllUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.json(users);
    } 
    catch (error) {
        // @ts-ignore
        res.status(500).json({ message: error.message || "lỗi server"});
    }
}

// @ts-ignore
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      // @ts-ignore
      message: error.message || "Lỗi server" 
    });
  }
}

// @ts-ignore
exports.createUser = async (req, res) => {
  try {
    const { provider, phone, email, name, password, avatar, role } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tên người dùng là bắt buộc' 
      });
    }

    if (!['phone', 'google', 'facebook'].includes(provider)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Provider không hợp lệ (phone, google, hoặc facebook)' 
      });
    }

    if (provider === 'phone' && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số điện thoại là bắt buộc khi đăng ký bằng phone' 
      });
    }

    if ((provider === 'google' || provider === 'facebook') && !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email là bắt buộc khi đăng ký bằng Google/Facebook' 
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { phone: phone },
        { email: email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số điện thoại hoặc email đã được đăng ký' 
      });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      provider,
      phone: provider === 'phone' ? phone : undefined,
      email: (provider === 'google' || provider === 'facebook') ? email : undefined,
      name,
      password: hashedPassword,
      avatar: avatar || null,
      role: role || 'user',
      isVerified: provider !== 'phone', // Google/Facebook auto verified
      lastLogin: new Date()
    });

    await newUser.save();

    // Trả về user (không trả password)
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // @ts-ignore
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số điện thoại hoặc email đã tồn tại' 
      });
    }

    res.status(500).json({ 
      success: false, 
      // @ts-ignore
      message: error.message || 'Lỗi server khi tạo user' 
    });
  }
};

// @ts-ignore
exports.userSignUp = async (req, res) => {
    try{
        const { username, phone, email, password, otpMethod} = req.body;

        if (!username || !password || !otpMethod) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc"
            });
        }

        if (otpMethod === 'email' && !email) {
            return res.status(400).json({
                message: "Email là bắt buộc khi chọn phương thức email"
            });
        }

        if (otpMethod === 'sms' && !phone) {
            return res.status(400).json({
                message: "Số điện thoại là bắt buộc khi chọn phương thức SMS"
            });
        }

        const signupData = {
            username: username,
            phone: phone,
            email: email,
            password: password,
            isVerified: false,
            otp: generateOTP(),
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
        }

        const existingUsername = await User.findOne({ username: username });
        const existiingPhonenum = await User.findOne({phone: phone});
        const existingEmail = await User.findOne({email: email});

        if(existingUsername){
            return res.status(400).json({message: "Username đã tồn tại"});
        }
        if(otpMethod === 'sms' && existiingPhonenum){
            return res.status(400).json({message: "Số điện thoại đã tồn tại"});
        }
        if(otpMethod === 'email' &&existingEmail){
            return res.status(400).json({message: "Email đã tồn tại"});
        }

        
        const encyptPassword = await bcrypt.hash(password, 10);
        signupData.password = encyptPassword;

        const newUser = new User(signupData);
        await newUser.save();
        
        if(otpMethod === 'sms'){
            await sendOTPbySMS(signupData.otp, phone);
        }

        if(otpMethod === 'email'){
            await sendOTPbyEmail(signupData.otp, email);
        }

        console.log('User created successfully:', newUser);
        res.status(201).json({
            success: true,
            message: 'User registered successfully, please verify OTP sent to your email',
            data: newUser
        });
    }
    catch(err){
        // @ts-ignore
        res.status(500).json({message: err.message || "lỗi server"});
    }
}

// Bước 1 của việc đăng ký - điền tài khoản và mật khẩu rồi lưu vào session
// @ts-ignore
exports.signUpStepOne = async (req, res) => {
  try{
    const {username, password, passwordConfirm} = req.body

    if(!username || !password || !passwordConfirm){
      return res.status(400).json({message: "Vui lòng điền đầy đủ thông tin cần thiết"});
    }

    if(password.length < 6){
      return res.status(400).json({message: "Mật khẩu phải có ít nhất 6 ký tự"});
    }

    if(password !== passwordConfirm){
      return res.status(400).json({message: "Mật khẩu không giống với xác nhận"});
    }

    req.session.signupData = {
        username,
        password: await bcrypt.hash(password, 10)
    };
    
    return res.status(200).json({message: "Bước 1 hoàn tất"});
  }
  catch(err){
    // @ts-ignore
    res.status(500).json({message: err.message || "lỗi server"});
  }
}

// @ts-ignore
exports.signUpStepTwo = async (req, res) => {
  try{
    const { otpMethod } = req.body;

    if (!req.session.signupData) {
        return res.status(400).json({
            message: "Vui lòng hoàn tất bước 1 trước"
        });
    }

    if (!otpMethod || !['email', 'sms'].includes(otpMethod)) {
        return res.status(400).json({
            message: "Phương thức phải là 'email' hoặc 'sms'"
        })
    };

    req.session.signupData.otpMethod = otpMethod;
    return res.status(200).json({message: "Bước 2 hoàn tất"});
  }
  catch(err){
    // @ts-ignore
    res.status(500).json({message: err.message || "lỗi server"});
  }
}

// @ts-ignore
exports.signUpStepThree = async (req, res) => {
  try{
    const {contact} = req.body

    if(!req.session.signupData || !req.session.signupData.otpMethod){
      return res.status(400).json({message: "Vui lòng hoàn tất bước 1 và 2 trước"});
    }

    const {username, password, otpMethod} = req.session.signupData;

    if(!contact){
      return res.status(400).json({message: "Vui lòng cung cấp thông tin liên lạc trước"})
    }

    if(otpMethod === 'sms'){
      const existingPhone = await User.findOne({ phone: contact });
      if (existingPhone) {
          return res.status(400).json({
              message: "Số điện thoại đã tồn tại"
          });
      }
    }
    else{
      const existingEmail = await User.findOne({ email: contact });
      if (existingEmail) {
          return res.status(400).json({
              message: "Email đã tồn tại"
          });
      }
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const userData = {
        username,
        password,
        isVerified: false,
        otp,
        otpMethod,
        otpExpiry
    };

    if (otpMethod === 'email') {
        // @ts-ignore
        userData.email = contact;
        // @ts-ignore
        userData.phone = null;
    } else {
        // @ts-ignore
        userData.phone = contact;
        // @ts-ignore
        userData.email = null;
    }

      const newUser = new User(userData);

      await newUser.save();
      if (otpMethod === 'email') {
          await sendOTPbyEmail(otp, contact);
      } else {
          await sendOTPbySMS(otp, contact);
      }

      req.session.signupData.contact = contact;
      req.session.signupData.userId = newUser._id.toString();

      res.status(200).json({
          message: `OTP đã được gửi đến ${otpMethod === 'email' ? 'email' : 'số điện thoại'} của bạn`
      });
  }
  catch(err){
    // @ts-ignore
    res.status(500).json({message: err.message || "lỗi server"});
  }
}

// @ts-ignore
exports.verifyOTP = async (req, res) => {
  try{
    const {email, otp} = req.body;
    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({message: "Không tìm thấy user"});
    }
    if(user.isVerified){
      return res.status(400).json({message: "tài khoản đã được xác thực"});
    }
    // @ts-ignore
    if(user.otp !== otp || user.otpExpiry < new Date()){
      return res.status(400).json({message: "OTP không hợp lệ hoặc đã hết hạn"});
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpMethod = undefined;
    user.otpExpiry = undefined;
    await user.save();

    req.session.signupData = null;

    res.json({message: "Tài khoản đã được xác thực, xin mời đăng nhập"})
  }
  catch(err){
    res.status(500).json({message: "Xảy ra lỗi khi xác thực OTP"})
  }
}

// @ts-ignore
exports.resendOTP = async (req, res) => {
  try{
    const otpMethod = req.session.signupData.otpMethod 
    const contact = req.session.signupData.contact;

    let user = null;

    if(otpMethod === 'sms') user = await User.findOne({phone: contact});
    else user = await User.findOne({email: contact});
    
      
    if(!user) return res.status(400).json({message: "Không tìm thấy user"});
    // @ts-ignore
    if(user.isVerified) return res.status(400).json({message: "Tài khoản đã được xác thực"});

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (otpMethod === 'email') {
        await sendOTPbyEmail(otp, contact);
    } else {
        await sendOTPbySMS(otp, contact);
    }

    res.json({message: "OTP đã được gửi lại thành công"});
  }
  catch(err){
    res.status(500).json({message: "Xảy ra lỗi khi gửi lại OTP"})
  }
}

// @ts-ignore
exports.userLogin = async (req, res) => {
    try{
        const {username, password} = req.body;
        const checkUser = await User.findOne({username: username});
        if(!checkUser){
            return res.status(404).json({message: "Không tìm thấy user"});
        }

        // @ts-ignore
        const passwordCheck = await bcrypt.compare(password, checkUser.password);
        if(!passwordCheck){
            return res.status(401).json({message: "Mật khẩu không đúng"});
        }
        if(!checkUser.isVerified){
            return res.status(401).json({message: "Tài khoản chưa được xác thực"});
        }

        req.session.user = checkUser;
        
        return res.status(200).json({message: `chào mừng đăng nhập ${username}`, data: checkUser});
        
    }
    catch(err){
       // @ts-ignore
      res.status(500).json({message: err.message || "lỗi server"});
    }
}

// @ts-ignore
exports.userLogout = async (req, res) => {
  // @ts-ignore
  req.session.destroy((err) => {
    if(err) return res.status(500).json({message: "Lỗi khi đăng xuất"});
    res.json({message: "Đăng xuất thành công"});
  })
}

// @ts-ignore
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, email, name, password, avatar, role, isVerified } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Chuẩn bị dữ liệu update
    const updateData = {};

    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (role) updateData.role = role;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;

    if (password) {
      // @ts-ignore
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Kiểm tra duplicate phone/email (nếu thay đổi)
    if (phone || email) {
      const duplicate = await User.findOne({
        _id: { $ne: id }, // Không phải user hiện tại
        $or: [
          { phone: phone },
          { email: email }
        ]
      });

      if (duplicate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Số điện thoại hoặc email đã được sử dụng bởi user khác' 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);

    // @ts-ignore
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số điện thoại hoặc email đã tồn tại' 
      });
    }

    res.status(500).json({ 
      success: false, 
      // @ts-ignore
      message: error.message || 'Lỗi server khi cập nhật user' 
    });
  }
};

// @ts-ignore
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm và xóa user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công',
      data: {
        id: deletedUser._id,
        username: deletedUser.username,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      // @ts-ignore
      message: error.message || 'Lỗi server khi xóa user' 
    });
  }
};


