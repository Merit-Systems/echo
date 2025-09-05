export default async function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="pt-10 md:pt-[15vh] relative min-h-screen flex flex-col items-center px-2 flex-1">
      <div className="max-w-md w-full">{children}</div>
    </div>
  );
}
