// Controller/ContextController.js
const Context = require('../Model/ContextSchema');
const User = require('../Model/UserSchema');

// API 1: Lấy toàn bộ Context của Admin (System)
// GET /api/context/all/admin
exports.getAdminContexts = async (req, res) => {
  try {
    // Query dựa trên Index 'isSystem' -> Tốc độ cao
    const contexts = await Context.find({ isSystem: true })
      .populate('moods', '_id name displayName icon colorCode') // Populate lấy chi tiết Mood
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    // Map lại dữ liệu cho đúng format bạn yêu cầu
    const responseData = contexts.map(ctx => ({
      _id: ctx._id,
      name: ctx.name,
      icon: ctx.icon,
      color: ctx.color,
      moods: ctx.moods,
      ownerId: ctx.ownerId, // null
      isSystem: ctx.isSystem, // true
      forkedFrom: ctx.forkedFrom,
      createdAt: ctx.createdAt
    }));

    res.status(200).json({
      message: 'Lấy danh sách context admin thành công',
      count: responseData.length,
      contextData: responseData
    });
  } catch (error) {
    console.error('Get Admin Context Error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// API 2: Lấy chi tiết 1 Context
// GET /api/context/choose/:id
exports.getContextById = async (req, res) => {
  try {
    const { id } = req.params;

    const context = await Context.findById(id)
      .populate('moods', '_id name displayName icon colorCode')
      .populate('ownerId', 'username name'); // Populate user để lấy tên

    if (!context) {
      return res.status(404).json({ message: 'Không tìm thấy ngữ cảnh' });
    }

    // Xử lý logic tên người tạo
    let createdUserName = 'System Admin';
    let createdUserId = null;

    if (context.ownerId) {
      // Nếu có ownerId thì lấy tên từ bảng User
      // @ts-ignore (Bỏ qua check type nếu dùng JS thuần)
      createdUserName = context.ownerId.name || context.ownerId.username || 'Unknown User';
      createdUserId = context.ownerId._id;
    } else {
      // Nếu ownerId null -> Là Admin
      createdUserId = 'admin-system-id';
    }

    // Format response
    const responseData = {
      _id: context._id,
      name: context.name,
      icon: context.icon,
      color: context.color,
      moods: context.moods,
      createdUserId: createdUserId,
      createdUserName: createdUserName,
      isSystem: context.isSystem,
      createdAt: context.createdAt
    };

    res.status(200).json({
      Id: context._id, // Theo yêu cầu của bạn
      contextData: responseData
    });

  } catch (error) {
    console.error('Get Context Detail Error:', error);
    res.status(500).json({ message: 'Lỗi server hoặc ID không hợp lệ' });
  }
};

// --- API 3: Lấy Context của User (Trừ system context) ---
// GET /api/context/all
exports.getUserContexts = async (req, res) => {
  try {
    // Lấy ID từ req.user (do middleware authenticationToken gán vào)
    // Payload trong auth.js là { _id: user._id ... }
    const userId = req.user._id; 

    if (!userId) {
      return res.status(401).json({ message: 'Không xác định được người dùng' });
    }

    // Query: Tìm context có ownerId trùng userId
    const userContexts = await Context.find({ ownerId: userId })
      .populate('moods', '_id name displayName icon colorCode')
      .sort({ createdAt: -1 });

    // Format dữ liệu trả về theo yêu cầu
    const responseData = userContexts.map(ctx => ({
      _id: ctx._id,
      name: ctx.name,
      icon: ctx.icon,
      color: ctx.color,
      moods: ctx.moods,
      ownerId: ctx.ownerId, 
      isSystem: false, // Context của user thì không phải system
      forkedFrom: ctx.forkedFrom,
      createdAt: ctx.createdAt
    }));

    res.status(200).json({
      contextData: responseData
    });

  } catch (error) {
    console.error('Get User Context Error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu người dùng' });
  }
};

// --- API 4: Thêm Context hệ thống (Admin) ---
// POST /api/context/add-context/admin
exports.addSystemContext = async (req, res) => {
  try {
    const { name, icon, color, moods } = req.body;

    // 1. Validation cơ bản
    if (!name || !moods) {
      return res.status(400).json({ message: 'Tên và danh sách Mood là bắt buộc' });
    }

    // 2. Kiểm tra điều kiện tối thiểu 3 moods
    if (!Array.isArray(moods) || moods.length < 3) {
      return res.status(400).json({ message: 'Một ngữ cảnh cần tối thiểu 3 mood để hoạt động hiệu quả' });
    }

    // 3. Tạo Context mới (Cứng ownerId = null và isSystem = true)
    const newContext = new Context({
      name,
      icon: icon || 'Sample.svg', // Default icon nếu không gửi
      color: color || '#FFFFFF',
      moods,              // Mảng các mood ID
      ownerId: null,      // QUAN TRỌNG: Admin tạo thì owner là null
      isSystem: true,     // Flag hệ thống
      forkedFrom: null    // Gốc
    });

    await newContext.save();

    // Populate để trả về data đầy đủ (hiện tên mood thay vì chỉ ID)
    await newContext.populate('moods', '_id name displayName icon colorCode');

    // 4. Format dữ liệu trả về
    const responseData = {
      _id: newContext._id,
      name: newContext.name,
      icon: newContext.icon,
      color: newContext.color,
      moods: newContext.moods,
      ownerId: null,
      isSystem: true,
      forkedFrom: null,
      createdAt: newContext.createdAt
    };

    res.status(201).json({
      message: 'Tạo ngữ cảnh hệ thống thành công',
      contextData: responseData
    });

  } catch (error) {
    console.error('Add System Context Error:', error);
    // Bắt lỗi trùng tên (nếu schema có unique)
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Tên ngữ cảnh này đã tồn tại trong hệ thống' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};


// API 5: Update Context (Xử lý Logic Fork/Duplicate)
// PUT /api/context/update/:contextId
exports.updateContext = async (req, res) => {
  try {
    const { contextId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    // 1. Tìm Context gốc
    const originalContext = await Context.findById(contextId);
    if (!originalContext) {
      return res.status(404).json({ message: 'Không tìm thấy ngữ cảnh' });
    }

    let finalContext;

    // TRƯỜNG HỢP 1: User đang sửa Context của Admin (System)
    // -> Tạo bản sao (Duplicate/Fork)
    if (originalContext.isSystem) {
      // Tạo context mới dựa trên thông tin cũ + thông tin update
      const forkedContext = new Context({
        name: updateData.name || originalContext.name, // Lấy tên mới hoặc giữ tên cũ
        icon: updateData.icon || originalContext.icon,
        color: updateData.color || originalContext.color,
        moods: updateData.moods || originalContext.moods, // Mood mới
        ownerId: userId,               // Sở hữu chuyển sang User
        isSystem: false,               // Không còn là system
        forkedFrom: originalContext._id // Đánh dấu nguồn gốc
      });

      await forkedContext.save();
      finalContext = forkedContext;
    } 
    
    // TRƯỜNG HỢP 2: User đang sửa Context của chính mình
    // -> Cập nhật trực tiếp
    else {
      // Check quyền sở hữu
      if (originalContext.ownerId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Không có quyền sửa' });
      }

      finalContext = await Context.findByIdAndUpdate(
        contextId,
        {
          name: updateData.name,
          icon: updateData.icon,
          color: updateData.color,
          moods: updateData.moods
          // Giữ nguyên ownerId, isSystem, forkedFrom
        },
        { new: true }
      );
    }

    // Populate để trả về
    await finalContext.populate('moods', '_id name displayName icon colorCode');

    // Format response
    const responseData = {
      _id: finalContext._id,
      name: finalContext.name,
      icon: finalContext.icon,
      color: finalContext.color,
      moods: finalContext.moods,
      ownerId: finalContext.ownerId,
      isSystem: finalContext.isSystem,
      forkedFrom: finalContext.forkedFrom,
      createdAt: finalContext.createdAt
    };

    res.status(200).json({
      message: originalContext.isSystem ? 'Đã tạo bản sao cá nhân hóa' : 'Cập nhật thành công',
      contextData: responseData
    });

  } catch (error) {
    console.error('Update Context Error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// --- API 6: Xóa Context (Dành cho Admin) ---
// DELETE /api/context/del/admin/:contextId
exports.deleteContextByAdmin = async (req, res) => {
  try {
    const { contextId } = req.params;

    // 1. Tìm và xóa
    const deletedContext = await Context.findByIdAndDelete(contextId)
      .populate('moods', '_id name displayName icon colorCode'); // Populate để trả về data đầy đủ lần cuối

    if (!deletedContext) {
      return res.status(404).json({ message: 'Không tìm thấy ngữ cảnh để xóa' });
    }

    // 2. Format dữ liệu đã xóa để trả về (cóp lại y chang)
    const deletedDataFormatted = {
      _id: deletedContext._id,
      name: deletedContext.name,
      icon: deletedContext.icon,
      color: deletedContext.color,
      moods: deletedContext.moods,
      ownerId: deletedContext.ownerId,
      isSystem: deletedContext.isSystem,
      forkedFrom: deletedContext.forkedFrom,
      createdAt: deletedContext.createdAt
    };

    res.status(200).json({
      message: "Xóa sự kiện thành công",
      deleted_data: deletedDataFormatted
    });

  } catch (error) {
    console.error('Delete Context Admin Error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa' });
  }
};

// API 7: Hiển thị Context cho User (Logic Override/Merge)
// GET /api/context/user
exports.getContextsForUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // B1. Lấy tất cả Context của User (Bao gồm tự tạo và đã fork)
    const userContexts = await Context.find({ ownerId: userId })
      .populate('moods', '_id name displayName icon colorCode')
      .sort({ createdAt: -1 });

    // B2. Lấy tất cả Context của Hệ thống
    const systemContexts = await Context.find({ isSystem: true })
      .populate('moods', '_id name displayName icon colorCode')
      .sort({ createdAt: -1 });

    // B3. Thuật toán "Override" (Ghi đè)
    // Tạo một Set chứa các ID gốc đã bị User "fork" (ghi đè)
    const forkedOriginalIds = new Set();
    
    userContexts.forEach(ctx => {
      if (ctx.forkedFrom) {
        forkedOriginalIds.add(ctx.forkedFrom.toString());
      }
    });

    // Lọc danh sách System: Chỉ giữ lại những cái CHƯA bị user fork
    const activeSystemContexts = systemContexts.filter(sysCtx => {
      return !forkedOriginalIds.has(sysCtx._id.toString());
    });

    // B4. Gộp 2 danh sách lại
    // Thứ tự: User Contexts (ưu tiên) + System Contexts còn lại
    const finalContexts = [...userContexts, ...activeSystemContexts];

    // Format dữ liệu trả về
    const responseData = finalContexts.map(ctx => ({
      _id: ctx._id,
      name: ctx.name,
      icon: ctx.icon,
      color: ctx.color,
      moods: ctx.moods,
      ownerId: ctx.ownerId,
      isSystem: ctx.isSystem,
      forkedFrom: ctx.forkedFrom,
      createdAt: ctx.createdAt
    }));

    res.status(200).json({
      count: responseData.length,
      contextData: responseData
    });

  } catch (error) {
    console.error('Get User Home Contexts Error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu' });
  }
};

// API 8: Thêm Context mới (Cá nhân hóa User)
// POST /api/context/add
// ==================================================================
exports.addUserContext = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, icon, color, moods } = req.body;

    // 1. Validate
    if (!name || !moods) {
      return res.status(400).json({ message: 'Tên và danh sách Mood là bắt buộc' });
    }
    if (!Array.isArray(moods) || moods.length < 3) {
      return res.status(400).json({ message: 'Cần tối thiểu 3 mood' });
    }

    // 2. Tạo Context mới
    const newContext = new Context({
      name,
      icon: icon || 'Sample.svg',
      color: color || '#FFFFFF',
      moods,
      ownerId: userId,      // Của User
      isSystem: false,      // Không phải hệ thống
      forkedFrom: null      // Tạo mới hoàn toàn, không phải bản sao
    });

    await newContext.save();
    await newContext.populate('moods', '_id name displayName icon colorCode');

    // 3. Format Response
    const responseData = {
      _id: newContext._id,
      name: newContext.name,
      icon: newContext.icon,
      color: newContext.color,
      moods: newContext.moods,
      ownerId: newContext.ownerId,
      isSystem: newContext.isSystem,
      forkedFrom: newContext.forkedFrom,
      createdAt: newContext.createdAt
    };

    res.status(201).json({
      message: 'Tạo ngữ cảnh cá nhân thành công',
      contextData: responseData
    });

  } catch (error) {
    console.error('Add User Context Error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// API 9: Cập nhật Mood trên Context (User)
// PATCH /api/context/mood-change/:contextId
exports.updateContextMoods = async (req, res) => {
  try {
    const { contextId } = req.params;
    const { moods } = req.body;
    // Lấy ID user từ token đã giải mã ở middleware auth.js
    const userId = req.user._id; 

    // 1. Validation đầu vào
    if (!moods || !Array.isArray(moods)) {
      return res.status(400).json({ message: 'Danh sách moods không hợp lệ' });
    }
    if (moods.length < 3) {
      return res.status(400).json({ message: 'Một ngữ cảnh cần tối thiểu 3 mood' });
    }

    // 2. Tìm Context gốc
    const originalContext = await Context.findById(contextId);
    if (!originalContext) {
      return res.status(404).json({ message: 'Không tìm thấy ngữ cảnh' });
    }

    let finalContext;

    // --- TRƯỜNG HỢP A: User sửa Context của Hệ thống (System) ---
    // -> Logic: Clone ra bản mới (Fork), giữ nguyên tên/ảnh cũ, chỉ thay Mood mới
    if (originalContext.isSystem) {
      const forkedContext = new Context({
        name: originalContext.name,       // Giữ nguyên tên gốc
        icon: originalContext.icon,       // Giữ nguyên icon gốc
        color: originalContext.color,     // Giữ nguyên màu gốc
        moods: moods,                     // <--- CẬP NHẬT MOOD MỚI TẠI ĐÂY
        ownerId: userId,                  // Chuyển chủ sở hữu sang User
        isSystem: false,                  // Không còn là system
        forkedFrom: originalContext._id   // Đánh dấu nguồn gốc để API 7 biết mà override
      });

      await forkedContext.save();
      finalContext = forkedContext;
    } 
    
    // --- TRƯỜNG HỢP B: User sửa Context của chính mình ---
    // -> Logic: Cập nhật trực tiếp vào DB
    else {
      // Kiểm tra quyền sở hữu (User A không được sửa nhạc của User B)
      if (originalContext.ownerId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa ngữ cảnh này' });
      }

      finalContext = await Context.findByIdAndUpdate(
        contextId,
        { moods: moods }, // Chỉ update trường moods
        { new: true }     // Trả về data mới nhất
      );
    }

    // 3. Populate để lấy đầy đủ thông tin Mood (tên, icon...) thay vì chỉ ID
    await finalContext.populate('moods', '_id name displayName icon colorCode');

    // 4. Format dữ liệu trả về y chang yêu cầu
    const responseData = {
      _id: finalContext._id,
      name: finalContext.name,
      icon: finalContext.icon,
      color: finalContext.color,
      moods: finalContext.moods,
      ownerId: finalContext.ownerId,
      isSystem: finalContext.isSystem,
      forkedFrom: finalContext.forkedFrom,
      createdAt: finalContext.createdAt
    };

    res.status(200).json({
      message: "Cập nhật Context thành công",
      data: responseData
    });

  } catch (error) {
    console.error('Update Mood Context Error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};