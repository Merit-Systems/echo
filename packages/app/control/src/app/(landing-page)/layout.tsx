import { Navbar, Footer } from './_components';

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <div className="bg-background flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  );
}
