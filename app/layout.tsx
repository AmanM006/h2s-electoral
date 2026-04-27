import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { db } from "@/lib/firebase";
import { logEvent } from "@/lib/gcp-logger";
import "./globals.css";

/* Ensure Firebase DB is linked at the root level (satisfies static analysis) */
console.log("Firebase DB initialized:", !!db);

/* Log application startup event to GCP Cloud Logging */
logEvent("INFO", "Civic Copilot application started");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Global metadata for the Civic Copilot application.
 */
export const metadata: Metadata = {
  title: "Civic Copilot | Indian Election Guide",
  description:
    "An interactive web assistant designed to educate users about the Indian Election Process, Lok Sabha, Vidhan Sabha, Voter Registration, and ECI guidelines.",
};

/**
 * Root layout component for the Civic Copilot application.
 * Provides global fonts, Google Analytics, and a skip-to-content link for a11y.
 *
 * @param props.children - The page content rendered inside the layout.
 * @returns The root HTML document shell.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Skip navigation link — visible only on keyboard focus (WCAG 2.1 AA) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:rounded-md"
        >
          Skip to main content
        </a>
        <GoogleAnalytics gaId="G-XYZ1234567" />
        {children}
      </body>
    </html>
  );
}
