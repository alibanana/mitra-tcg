export const siteConfig = {
  name: "Mitra TCG",
  description: "One Piece & Pokémon Trading Cards — English Raw & Graded",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  instagram: "https://instagram.com/mitra.tcg",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || "",
  nav: {
    marketing: [
      { title: "Home", href: "/" },
      { title: "Products", href: "/products" },
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
    ],
    dashboard: [
      { title: "Overview", href: "/dashboard" },
      { title: "Products", href: "/dashboard/products" },
      { title: "Categories", href: "/dashboard/categories" },
      { title: "Settings", href: "/dashboard/settings" },
    ],
  },
}
