import { ThemeToggle } from '../ui/theme-toggle';

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Lonch. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
