import * as React from 'react';

import {
  Switch as SwitchPrimitive,
  SwitchThumb as SwitchThumbPrimitive,
  SwitchIcon as SwitchIconPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from '@/components/animate-ui/primitives/radix/switch';
import { cn } from '@/lib/utils';

type SwitchProps = SwitchPrimitiveProps & {
  pressedWidth?: number;
  startIcon?: React.ReactElement;
  endIcon?: React.ReactElement;
  thumbIcon?: React.ReactElement;
};

function Switch({
  className,
  pressedWidth = 34,
  startIcon,
  endIcon,
  thumbIcon,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive
      className={cn(
        'relative peer flex h-[31px] w-[51px] px-0.5 shrink-0 cursor-pointer items-center justify-start rounded-full outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-tint/30 disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-tint data-[state=checked]:shadow-[0_0_16px_-2px_var(--tint)] data-[state=unchecked]:bg-white/10 data-[state=checked]:justify-end',
        className,
      )}
      {...props}
    >
      <SwitchThumbPrimitive
        className={cn(
          'relative z-10 bg-white pointer-events-none block size-[27px] rounded-full shadow-[0_3px_8px_rgb(0_0_0/0.15),0_3px_1px_rgb(0_0_0/0.06)] ring-0',
        )}
        pressedAnimation={{ width: pressedWidth }}
      >
        {thumbIcon && (
          <SwitchIconPrimitive
            position="thumb"
            className="absolute [&_svg]:size-[9px] left-1/2 top-1/2 -translate-1/2 dark:text-neutral-500 text-neutral-400"
          >
            {thumbIcon}
          </SwitchIconPrimitive>
        )}
      </SwitchThumbPrimitive>

      {startIcon && (
        <SwitchIconPrimitive
          position="left"
          className="absolute [&_svg]:size-[9px] left-0.5 top-1/2 -translate-y-1/2 dark:text-neutral-500 text-neutral-400"
        >
          {startIcon}
        </SwitchIconPrimitive>
      )}
      {endIcon && (
        <SwitchIconPrimitive
          position="right"
          className="absolute [&_svg]:size-[9px] right-0.5 top-1/2 -translate-y-1/2 dark:text-neutral-400 text-neutral-500"
        >
          {endIcon}
        </SwitchIconPrimitive>
      )}
    </SwitchPrimitive>
  );
}

export { Switch, type SwitchProps };
