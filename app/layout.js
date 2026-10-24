import './globals.css';
export const metadata = { title: 'Calabash', description: 'Catch it early. Care for every student.' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
