"use client";
import * as React from "react";
import { Drawer as Primitive } from "vaul";
import { cn } from "../../lib/utils.js";

export const Drawer = Primitive.Root;
export const DrawerTrigger = Primitive.Trigger;
export const DrawerPortal = Primitive.Portal;

export const DrawerOverlay = React.forwardRef((props, ref) => (
  <Primitive.Overlay
    ref={ref}
    data-slot="drawer-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 fade-out-0"
    )}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

export const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <Primitive.Content
      ref={ref}
      data-slot="drawer-content"
      className={cn(
        "fixed z-50 flex flex-col bg-background h-auto",
        "data-[vaul-drawer-direction=right]:right-0 inset-y-0 w-3/4 sm:max-w-sm border-l",
        className
      )}
      {...props}
    >
      {children}
    </Primitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

export const DrawerClose = React.forwardRef((props, ref) => (
  <Primitive.Close ref={ref} data-slot="drawer-close" {...props} />
));
DrawerClose.displayName = "DrawerClose";

export const DrawerHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
);

export const DrawerFooter = ({ className, ...props }) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);

export const DrawerTitle = React.forwardRef((props, ref) => (
  <Primitive.Title ref={ref} data-slot="drawer-title" className={cn("font-semibold text-foreground", props.className)} {...props} />
));
DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = React.forwardRef((props, ref) => (
  <Primitive.Description ref={ref} data-slot="drawer-description" className={cn("text-sm text-muted-foreground", props.className)} {...props} />
));
DrawerDescription.displayName = "DrawerDescription";
