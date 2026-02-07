import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Sacramento,
  Satisfy,
  Sevillana,
  Playfair_Display,
  Josefin_Sans,
  Adamina,
  Open_Sans,
} from "next/font/google";
import "./globals.css";
import ParentNavbar from "@/components/NavbarUI/ParentNavbar";
import Footer from "@/components/Footer";
import PaymentGatewayWrapper from "@/components/Payment/PaymentGatewayWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: ["400"],
});

const satisfy = Satisfy({
  variable: "--font-satisfy",
  subsets: ["latin"],
  weight: ["400"],
});
const sevillana = Sevillana({
  variable: "--font-sevillana",
  subsets: ["latin"],
  weight: ["400"],
});
const adamina = Adamina({
  variable: "--font-adamina",
  subsets: ["latin"],
  weight: ["400"],
});
const playfair_display = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400"],
});

const josefin_sans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["100"],
});

const open_sans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "The JWEL",
  description: "Shop premium American Diamond and traditional Temple Jewellery at TheJWEL, Kolkata. Explore elegant bangles, rings, necklaces & more – crafted for modern and timeless beauty.",
  icons: {
    icon: [
      {
        url: "/faviconFolder/favicon.ico",
      },
      {
        url:"/faviconFolder/android-chrome-192x192.png",
        sizes:"192x192",
        type:"image/png",
      },
      {
        url:"/faviconFolder/android-chrome-512x512.png",
        sizes:"512x512",
        type:"image/png",
      },
      {
        url:"/faviconFolder/favicon-32x32.png",
        sizes:"32x32",
        type:"image/png",
      },
      {
        url:"/faviconFolder/favicon-16x16.png",
        sizes:"16x16",
        type:"image/png",
      },
    
    ],
    apple:[
      {
        url:"/faviconFolder/apple-touch-icon.png",
        sizes:"180x180",
        type:"image/png",
      },
    ],
  },
};


export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sacramento.variable} ${satisfy.variable} ${sevillana.variable} ${playfair_display.variable} ${josefin_sans.variable} ${adamina.variable} ${open_sans.variable} antialiased`}
      >
        <ParentNavbar />
        {children}
        <Footer />
        <PaymentGatewayWrapper />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
