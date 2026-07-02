type DashboardEmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const DashboardEmptyState = ({ title, description, action }: DashboardEmptyStateProps) => (
  <div className="rounded-2xl border border-dashed bg-white px-6 py-10 text-center">
    <h3 className="font-medium text-[#021B09]">{title}</h3>
    {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
