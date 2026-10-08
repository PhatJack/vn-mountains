import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field-group" className={cn("flex flex-col gap-6", className)} {...props} />
  );
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn(
        "group/field flex w-full flex-col gap-2",
        "data-[invalid=true]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  children,
  requiredAtRisk,
  ...props
}: React.ComponentProps<typeof Label> & {
  requiredAtRisk?: boolean;
}) {
  return (
    <Label data-slot="field-label" className={className} {...props}>
      {children}
      {requiredAtRisk && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </Label>
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null;

  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel };
