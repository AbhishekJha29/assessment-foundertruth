import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'FounderTruth - Founder Content & Intelligence Feed',
  description: 'Curated, real-time insights, playbooks, and tech news for founders and operators.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">{children}</main>
          <footer className="footer">
            <p>© {new Date().getFullYear()} FounderTruth Feed Platform. Built with Next.js & Express.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
