import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AliExpress — Global Multi-Vendor Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1A1A1A 0%, #E53935 50%, #1A1A1A 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#E53935",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#E53935",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 900,
              color: "white",
            }}
          >
            M
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: "white", lineHeight: 1 }}>
              AliExpress
            </span>
            <span style={{ fontSize: 24, fontWeight: 600, color: "#E53935", lineHeight: 1, marginTop: 4 }}>
              EXPRESS
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "#d1d5db",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          Shop millions of products from 50,000+ verified sellers in 190+ countries
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 48,
          }}
        >
          {[
            { num: "2M+", label: "Products" },
            { num: "50K+", label: "Sellers" },
            { num: "190+", label: "Countries" },
            { num: "10M+", label: "Customers" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 36, fontWeight: 800, color: "#E53935" }}>
                {stat.num}
              </span>
              <span style={{ fontSize: 16, color: "#9ca3af" }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <p
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#6b7280",
          }}
        >
          aliexpressexpress.com
        </p>
      </div>
    ),
    { ...size }
  );
}
