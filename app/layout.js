import './globals.css';
export const metadata = { title: 'Calabash', description: 'Catch it early. Care for every student.' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;800&family=DM+Sans:wght@400;500;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
