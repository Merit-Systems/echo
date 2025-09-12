export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-10 md:pt-[15vh] relative min-h-screen flex flex-col items-center px-2 flex-1">
      <div className="max-w-md w-full flex flex-col flex-1">{children}</div>
    </div>
  );
}
