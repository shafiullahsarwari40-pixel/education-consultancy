import { ImageResponse } from "next/og";

export const alt =
  "Horizon Educational Consultancy — Your future in Türkiye starts with the right plan.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#071a2f",
        color: "#faf7ed",
        padding: "64px 76px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 30,
          letterSpacing: "-1px",
        }}
      >
        Horizon<span style={{ color: "#d1b779" }}>.</span>
        <span
          style={{
            fontSize: 14,
            letterSpacing: "3px",
            marginLeft: 30,
            color: "#b9c6cc",
          }}
        >
          EDUCATIONAL CONSULTANCY
        </span>
      </div>
      <div
        style={{
          display: "flex",
          width: 980,
          fontSize: 78,
          lineHeight: 1.08,
          letterSpacing: "-3px",
          marginTop: 82,
        }}
      >
        Your future in Türkiye starts with the right plan.
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #37505a",
          paddingTop: 30,
          marginTop: 54,
          fontSize: 20,
          color: "#cfdbde",
        }}
      >
        <span>University discovery · Application support · Student portal</span>
        <span style={{ color: "#d1b779" }}>horizoneducon.com</span>
      </div>
    </div>,
    size,
  );
}
