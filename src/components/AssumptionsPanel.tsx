type AssumptionsPanelProps = {
  assumptions: string[];
  title?: string;
};

export default function AssumptionsPanel({
  assumptions,
  title = "Estimation assumptions",
}: AssumptionsPanelProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Methodology
      </p>
      <h2 className="mt-3 text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">
        These figures are estimates derived from conservative inputs. They do
        not represent direct measurement or auditing.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-zinc-700">
        {assumptions.map((assumption) => (
          <li key={assumption} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-zinc-400" />
            <span>{assumption}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
