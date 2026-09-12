import "./globals.css";

import { AppShell } from "@/components/AppShell";

export const metadata = { title: "KSADB" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('ksadb-theme');" +
              "if(t==='light'||t==='dark')" +
              "document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
