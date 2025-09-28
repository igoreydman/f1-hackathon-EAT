import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Explain-a-thon AMA | Expert Q&A Platform",
  description: "Create interactive AMA sessions where experts can explain complex topics through structured Q&A. Join the conversation and learn from the best.",
  keywords: ["AMA", "Ask Me Anything", "Q&A", "Expert", "Learning", "Education", "Explain-a-thon"],
  authors: [{ name: "Explain-a-thon Team" }],
  creator: "Explain-a-thon",
  publisher: "Explain-a-thon",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Explain-a-thon AMA | Expert Q&A Platform",
    description: "Create interactive AMA sessions where experts can explain complex topics through structured Q&A.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explain-a-thon AMA",
    description: "Expert Q&A Platform for Interactive Learning",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
