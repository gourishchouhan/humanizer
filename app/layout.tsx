import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Humanizer",
  description: "Make text clearer and more natural",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Prevent theme flash: set data-theme before hydration */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function(){
              try {
                var t = localStorage.getItem('theme');
                if (!t) t = 'dark';
                document.documentElement.setAttribute('data-theme', t);
              } catch(_) {}
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
