import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Mini POS',
  description: 'ระบบขายของร้านเล็ก',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <header className="navbar">
          <div className="navbar-brand">Mini POS</div>
          <nav className="navbar-menu">
            <Link href="/">หน้าแรก</Link>
            <Link href="/sell">ขายสินค้า</Link>
            <Link href="/history">ประวัติการขาย</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
