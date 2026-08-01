type Props = {
  badge?: string;
  title: string;
  subtitle: string;
};

export default function SectionTitle({
  badge,
  title,
  subtitle,
}: Props) {
  return (
    <div className="mx-auto mb-16 max-w-3xl text-center">
      {badge && (
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
          {badge}
        </span>
      )}

      <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-lg leading-8 text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}