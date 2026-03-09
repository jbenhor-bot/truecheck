import "./globals.css";

export const metadata = {
  title: "TrueCheck",
  description: "Verificação de conteúdo com IA"
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, Arial",
          backgroundColor: "#07111f",
          color: "white",
          minHeight: "100vh"
        }}
      >
        {children}
      </body>
    </html>
  );
}
