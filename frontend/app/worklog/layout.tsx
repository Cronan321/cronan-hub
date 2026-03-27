// Strip the global header/footer/background for the worklog route
export default function WorklogLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <body style={{ margin: 0, padding: 0, background: 'rgb(8,12,28)' }}>
        {children}
      </body>
    </html>
  );
}
