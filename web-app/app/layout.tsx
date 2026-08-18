import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata: Metadata = {
  title: "CRM | O Positive Health",
  description: "A CRM for O Positive Health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans" cz-shortcut-listen="true">
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <div vaul-drawer-wrapper="">
              {children}
              <Toaster position="top-right" />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
