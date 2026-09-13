"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function HistoryPage() {
  // รายการประวัติการขายทั้งหมด
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // โหลดข้อมูลตอน mount
  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("sold_at", { ascending: false }); // ล่าสุดไปเก่าสุด

    if (error) {
      setError(error.message);
    } else {
      setSales(data);
    }
    setLoading(false);
  }

  // คำนวณยอดขายรวมทั้งหมดจาก total_price ของทุกแถว
  const grandTotal = sales.reduce(
    (sum, sale) => sum + Number(sale.total_price),
    0
  );

  // แปลงเวลาให้อ่านง่าย (แบบไทย)
  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div>
      <h1>ประวัติการขาย</h1>

      {loading && <p>กำลังโหลดข้อมูล...</p>}
      {error && <p style={{ color: "red" }}>เกิดข้อผิดพลาด: {error}</p>}

      {!loading && !error && (
        <>
          {/* ยอดขายรวมทั้งหมด */}
          <div className="card" style={{ fontSize: "18px", fontWeight: "600" }}>
            ยอดขายรวมทั้งหมด: {grandTotal.toFixed(2)} บาท
          </div>

          {/* ตารางประวัติการขาย */}
          <table>
            <thead>
              <tr>
                <th>วันเวลาที่ขาย</th>
                <th>ชื่อสินค้า</th>
                <th>จำนวน</th>
                <th>ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4}>ยังไม่มีประวัติการขาย</td>
                </tr>
              )}
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{formatDateTime(sale.sold_at)}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity}</td>
                  <td>{Number(sale.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
