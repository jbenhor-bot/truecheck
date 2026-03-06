export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      background: "#f5f7fb",
      color: "#111"
    }}>
      <h1 style={{ fontSize: "40px", marginBottom: "16px" }}>
        TrueCheck
      </h1>
      <p style={{ fontSize: "18px", maxWidth: "600px", textAlign: "center" }}>
        Welcome to TrueCheck AI. This is the beginning of your Next.js project.
      </p>
    </main>
  );
}
