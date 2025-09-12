export const ErrorPageContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col flex-1">
      <div className="h-4 border-b bg-card" />
      {children}
    </div>
  );
};
