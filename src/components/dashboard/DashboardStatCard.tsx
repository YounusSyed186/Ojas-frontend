type DashboardStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export const DashboardStatCard = ({ label, value, hint }: DashboardStatCardProps) => (
  <div className="rounded-2xl border bg-white p-4 shadow-sm">
    <div className="text-2xl font-display font-semibold text-[#021B09]">{value}</div>
    <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    {hint && <div className="mt-2 text-[11px] text-muted-foreground/80">{hint}</div>}
  </div>
);
