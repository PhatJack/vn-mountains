import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Align, Side } from "@base-ui/react/internals/useAnchorPositioning";

interface TooltipCustomProps {
  render: React.ReactElement;
  children: React.ReactNode;
  side?: Side;
  align?: Align;
  classNameContent?: string;
}

export function TooltipCustom({
  render,
  children,
  side,
  align,
  classNameContent,
}: TooltipCustomProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={render} />
      <TooltipContent side={side} align={align} className={`max-w-xs ${classNameContent}`}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
