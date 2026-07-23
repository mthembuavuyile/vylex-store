import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://store.vylex.co.za"),
  title: "Vylex Store | Premium Consumer Tech & Accessories",
  description: "Premium online store for Vylex high-quality consumer electronics, power banks, audio, smart wearables, and chargers with nationwide delivery across South Africa.",
  alternates: {
    canonical: "https://store.vylex.co.za",
  },
  openGraph: {
    title: "Vylex Store | Premium Consumer Tech & Accessories",
    description: "Premium online store for Vylex high-quality consumer electronics, power banks, audio, smart wearables, and chargers across South Africa.",
    url: "https://store.vylex.co.za",
    siteName: "Vylex Store",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vylex Store | Premium Consumer Tech & Accessories",
    description: "Discover top-tier power banks, audio gear, smartwatches, and accessories at Vylex Store.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" }
    ]
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://store.vylex.co.za/#organization",
      "name": "Vylex Store",
      "url": "https://store.vylex.co.za",
      "sameAs": ["https://vylex.co.za"],
      "logo": "https://store.vylex.co.za/logo.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://store.vylex.co.za/#website",
      "url": "https://store.vylex.co.za",
      "name": "Vylex Store",
      "publisher": {
        "@id": "https://store.vylex.co.za/#organization"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${firaCode.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
