const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const { ProductVariant, Product, UserHiddenVariant } = require("../models");
const { sendNotificationToRole } = require("../services/notifications");

router.post("/products/:id/variants", upload.none(),async (req, res) => {
    const { id } = req.params;
    const { color, size } = req.body;

    if (!color || !size) {
        return res.status(400).json({ error: "اللون والحجم مطلوبين" });
    }

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: "المنتج غير موجود" });
        }

        const variant = await ProductVariant.create({
            product_id: id,
            color,
            size
        });

        await sendNotificationToRole(
        "user",
        `تمت إضافة نوع جديد (${color} - ${size}) إلى المنتج "${product.title}"`,
        "إضافة نوع جديد للمنتج"
        );
        
        res.status(201).json(variant);
    } catch (error) {
        console.error("❌ Error creating variant:", error);
        res.status(500).json({ error: "خطأ داخلي في الخادم" });
    }
});

router.get("/products/:id/variants", async (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id;

  try {
    let variants = await ProductVariant.findAll({ where: { product_id: id } });

    const hidden = await UserHiddenVariant.findAll({
      where: { user_id: userId },
      attributes: ["variant_id"],
    });

    const hiddenIds = hidden.map(h => h.variant_id);

    variants = variants.filter(v => !hiddenIds.includes(v.id));

    res.json(variants);
  } catch (error) {
    console.error("❌ Error fetching variants:", error);
    res.status(500).json({ error: "خطأ داخلي في الخادم" });
  }
});

router.delete("/variants/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id;

  try {
    const variant = await ProductVariant.findByPk(id);
    if (!variant) return res.status(404).json({ error: "الـ variant غير موجود" });

    await UserHiddenVariant.create({
      user_id: userId,
      variant_id: id,
    });

    res.json({ message: "تم إخفاء الـ variant من حسابك فقط" });
  } catch (error) {
    console.error("❌ Error hiding variant:", error);
    res.status(500).json({ error: "خطأ داخلي في الخادم" });
  }
});

router.get("/products-with-variants", async (req, res) => {
  const userId = req.query.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const offset = (page - 1) * limit;

  if (!userId) {
    return res.status(400).json({ error: "يجب إرسال user_id في الاستعلام" });
  }

  try {
    const hiddenVariants = await UserHiddenVariant.findAll({
      where: { user_id: userId },
      attributes: ["variant_id"],
    });
    const hiddenIds = hiddenVariants.map(h => h.variant_id);

    const { rows } = await Product.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: ProductVariant,
          as: "variants",
          where: hiddenIds.length ? { id: { [require("sequelize").Op.notIn]: hiddenIds } } : {},
          required: true,
          order: [["createdAt", "Asc"]],
        },
      ],
      order: [["createdAt", "DESC"]], 
    });

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching products with variants:", error);
    res.status(500).json({ error: "خطأ داخلي في الخادم" });
  }
});



module.exports = router;
