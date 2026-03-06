export const metadata = {
  title: "TrueCheck",
  description: "TrueCheck AI"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
