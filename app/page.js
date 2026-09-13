"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  // รายการสินค้าทั้งหมด
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ฟอร์มเพิ่มสินค้าใหม่
  const [form, setForm] = useState({
    sku: "",
    name: "",
    price: "",
    stock: "",
    unit: "",
  });

  // สถานะสำหรับแก้ไขสินค้าแบบ inline (เก็บ id แถวที่กำลังแก้ไข + ค่าฟอร์มแก้ไข)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // โหลดสินค้าทั้งหมดตอน mount
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }

  // ---------- เพิ่มสินค้าใหม่ ----------
  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!form.sku || !form.name) {
      alert("กรุณากรอก SKU และชื่อสินค้า");
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        sku: form.sku,
        name: form.name,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock) || 0,
        unit: form.unit,
      },
    ]);

    if (error) {
      alert("เพิ่มสินค้าไม่สำเร็จ: " + error.message);
      return;
    }

    // เคลียร์ฟอร์มและโหลดข้อมูลใหม่
    setForm({ sku: "", name: "", price: "", stock: "", unit: "" });
    fetchProducts();
  }

  // ---------- ลบสินค้า ----------
  async function handleDelete(id) {
    const confirmDelete = confirm("ยืนยันการลบสินค้านี้?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("ลบไม่สำเร็จ: " + error.message);
      return;
    }
    fetchProducts();
  }

  // ---------- แก้ไขสินค้าแบบ inline ----------
  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleSaveEdit(id) {
    const { error } = await supabase
      .from("products")
      .update({
        sku: editForm.sku,
        name: editForm.name,
        price: parseFloat(editForm.price) || 0,
        stock: parseInt(editForm.stock) || 0,
        unit: editForm.unit,
      })
      .eq("id", id);

    if (error) {
      alert("บันทึกไม่สำเร็จ: " + error.message);
      return;
    }

    cancelEdit();
    fetchProducts();
  }

  return (
    <div>
      <h1>รายการสินค้า</h1>

      {/* ฟอร์มเพิ่มสินค้าใหม่ */}
      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: "16px" }}>เพิ่มสินค้าใหม่</h2>
        <form
          onSubmit={handleAddProduct}
          style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
        >
          <input
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleFormChange}
            style={{ flex: "1 1 100px" }}
          />
          <input
            name="name"
            placeholder="ชื่อสินค้า"
            value={form.name}
            onChange={handleFormChange}
            style={{ flex: "2 1 160px" }}
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="ราคา"
            value={form.price}
            onChange={handleFormChange}
            style={{ flex: "1 1 80px" }}
          />
          <input
            name="stock"
            type="number"
            placeholder="คงเหลือ"
            value={form.stock}
            onChange={handleFormChange}
            style={{ flex: "1 1 80px" }}
          />
          <input
            name="unit"
            placeholder="หน่วย"
            value={form.unit}
            onChange={handleFormChange}
            style={{ flex: "1 1 80px" }}
          />
          <button type="submit">เพิ่มสินค้า</button>
        </form>
      </div>

      {/* แสดงสถานะโหลด/error */}
      {loading && <p>กำลังโหลดข้อมูล...</p>}
      {error && <p style={{ color: "red" }}>เกิดข้อผิดพลาด: {error}</p>}

      {/* ตารางสินค้า */}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>ชื่อสินค้า</th>
              <th>ราคา</th>
              <th>คงเหลือ</th>
              <th>หน่วย</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6}>ยังไม่มีสินค้า</td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id}>
                {editingId === product.id ? (
                  // ---------- แถวโหมดแก้ไข ----------
                  <>
                    <td>
                      <input
                        name="sku"
                        value={editForm.sku}
                        onChange={handleEditChange}
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        style={{ width: "120px" }}
                      />
                    </td>
                    <td>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={handleEditChange}
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        name="stock"
                        type="number"
                        value={editForm.stock}
                        onChange={handleEditChange}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        name="unit"
                        value={editForm.unit}
                        onChange={handleEditChange}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleSaveEdit(product.id)}>
                        บันทึก
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ backgroundColor: "#9ca3af" }}
                      >
                        ยกเลิก
                      </button>
                    </td>
                  </>
                ) : (
                  // ---------- แถวโหมดแสดงปกติ ----------
                  <>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{Number(product.price).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.unit}</td>
                    <td style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => startEdit(product)}>แก้ไข</button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{ backgroundColor: "#dc2626" }}
                      >
                        ลบ
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
