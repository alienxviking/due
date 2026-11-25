import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

/**
 * Frosted-glass card with Aceternity's glowing border that follows the pointer.
 * The outer ring + inner panel mirror the Aceternity "glowing effect" demo.
 */
export function GlassCard({ children, className, innerClassName, glow = true }: { children: React.ReactNode; className?: string; innerClassName?: string; glow?: boolean }) {
  return (
    <div className={cn("relative rounded-[22px] border border-sep p-1.5", className)}>
      {glow && <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />}
      <div className={cn("relative h-full overflow-hidden rounded-[17px] border border-white/[0.06] bg-[#0c0c0e]/80 shadow-[0_0_24px_-12px_rgb(0_0_0/0.6)] backdrop-blur-md", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
