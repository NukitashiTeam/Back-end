const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('../Model/UserSchema'); // import UserSchema

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
        const { username, phone, email, password } = req.body;

        const signupData = {
            username: username,
            phone: phone,
            email: email,
            password: password,
            isVerified: true
        }

        const existingUsername = await User.findOne({ username: username });
        const existiingPhonenum = await User.findOne({phone: phone});
        const existingEmail = await User.findOne({email: email});

        if(existingUsername){
            return  res.status(400).json({message: "Username đã tồn tại"});
        }
        if(existiingPhonenum){
            return  res.status(400).json({message: "Số điện thoại đã tồn tại"});
        }
        if(existingEmail){
            return  res.status(400).json({message: "Email đã tồn tại"});
        }
        
        const encyptPassword = await bcrypt.hash(password, 10);
        signupData.password = encyptPassword;

        const newUser = new User(signupData);
        await newUser.save();
        console.log('User created successfully:', newUser);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    }
    catch(err){
        // @ts-ignore
        res.status(500).json({message: err.message || "lỗi server"});
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
        if(passwordCheck){
            return res.status(200).json({message: `chào mừng đăng nhập ${username}`, data: checkUser});
        }
        else{
            return res.status(401).json({message: "Mật khẩu không đúng"});
        }
    }
    catch(err){

    }
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


