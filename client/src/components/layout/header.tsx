import { Card } from "@/components/ui/card";

export default function Header() {
  return (
    <header className="gradient-warm border-b border-soft-golden/20 px-8 py-6 hero-pattern">
      <div className="text-center">
        <h1 className="text-2xl font-serif-accent font-semibold text-charcoal mb-2">
          Discipline is choosing between what you want and what you want most
        </h1>
        <p className="text-lg text-soft-black/80 font-serif-accent italic">
          When you lack motivation you can always choose discipline
        </p>
      </div>
    </header>
  );
}
