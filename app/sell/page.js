"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SellPage() {
  // รายการสินค้าทั้งหมด (สำหรับ dropdown)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // สินค้าที่เลือกและจำนวนที่จะขาย
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  // สถานะระหว่างบันทึกการขาย + ข้อความแจ้งผล
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // โหลดสินค้าทั้งหมดตอน mount
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  // หาสินค้าที่เลือกอยู่จาก id
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // คำนวณยอดรวม = ราคา x จำนวน
  const qtyNumber = parseInt(quantity) || 0;
  const totalPrice = selectedProduct
    ? Number(selectedProduct.price) * qtyNumber
    : 0;

  function resetForm() {
    setSelectedProductId("");
    setQuantity("");
  }

  async function handleSell(e) {
    e.preventDefault();
    setMessage("");

    if (!selectedProduct) {
      alert("กรุณาเลือกสินค้า");
      return;
    }
    if (qtyNumber <= 0) {
      alert("กรุณากรอกจำนวนที่จะขายให้ถูกต้อง");
      return;
    }

    // ตรวจสอบว่า stock เพียงพอหรือไม่
    if (qtyNumber > selectedProduct.stock) {
      alert(
        `สินค้าคงเหลือไม่เพียงพอ (คงเหลือ ${selectedProduct.stock} ${selectedProduct.unit})`
      );
      return;
    }

    setSaving(true);

    // 1) บันทึกรายการลงตาราง sales
    const { error: saleError } = await supabase.from("sales").insert([
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: qtyNumber,
        total_price: totalPrice,
        sold_at: new Date().toISOString(),
      },
    ]);

    if (saleError) {
      alert("บันทึกการขายไม่สำเร็จ: " + saleError.message);
      setSaving(false);
      return;
    }

    // 2) อัปเดต stock ในตาราง products ให้ลดลงตามจำนวนที่ขาย
    const newStock = selectedProduct.stock - qtyNumber;
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", selectedProduct.id);

    if (updateError) {
      alert("อัปเดตสต๊อกไม่สำเร็จ: " + updateError.message);
      setSaving(false);
      return;
    }

    // สำเร็จ: แจ้งผล, เคลียร์ฟอร์ม, โหลดสินค้าใหม่ (เพื่อ stock ล่าสุด)
    setMessage(
      `ขาย "${selectedProduct.name}" จำนวน ${qtyNumber} ${selectedProduct.unit} สำเร็จ (รวม ${totalPrice.toFixed(
        2
      )} บาท)`
    );
    resetForm();
    fetchProducts();
    setSaving(false);
  }

  return (
    <div>
      <h1>ขายสินค้า</h1>

      {loading && <p>กำลังโหลดข้อมูลสินค้า...</p>}
      {error && <p style={{ color: "red" }}>เกิดข้อผิดพลาด: {error}</p>}

      {!loading && !error && (
        <div className="card">
          <form
            onSubmit={handleSell}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* Dropdown เลือกสินค้า */}
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>
                เลือกสินค้า
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">-- เลือกสินค้า --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {Number(p.price).toFixed(2)} บาท (คงเหลือ{" "}
                    {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* ช่องกรอกจำนวน */}
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>
                จำนวนที่จะขาย
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="จำนวน"
                style={{ width: "100%" }}
              />
            </div>

            {/* แสดงยอดรวมอัตโนมัติ */}
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              ยอดรวม: {totalPrice.toFixed(2)} บาท
            </div>

            <button type="submit" disabled={saving}>
              {saving ? "กำลังบันทึก..." : "ขาย"}
            </button>
          </form>

          {/* ข้อความยืนยันเมื่อขายสำเร็จ */}
          {message && (
            <p style={{ color: "#16a34a", marginTop: "12px" }}>{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
