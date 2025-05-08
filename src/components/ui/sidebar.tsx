
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, X } from "lucide-react" // Added X for close button

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet" // Added SheetHeader, SheetTitle, SheetClose
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "260px" // Slightly wider for better content display
const SIDEBAR_WIDTH_MOBILE = "280px" // For mobile sheet
const SIDEBAR_WIDTH_ICON = "60px" // For collapsed icon-only state
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean // Desktop sidebar state
  setOpen: (open: boolean) => void
  openMobile: boolean // Mobile sheet state
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

// Load sidebar state from cookie
const getInitialSidebarState = (defaultOpen: boolean): boolean => {
  if (typeof window === 'undefined') return defaultOpen; // SSR safety
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
    ?.split('=')[1];
  return cookieValue ? cookieValue === 'true' : defaultOpen;
};


const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    
    // Initialize desktop sidebar state from cookie or default
    const [_open, _setOpen] = React.useState(() => getInitialSidebarState(defaultOpen));
    const open = openProp ?? _open;

    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        if (typeof window !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open]
    )
    
    React.useEffect(() => {
      // Update state if prop changes (controlled component)
      if (openProp !== undefined && openProp !== _open) {
        _setOpen(openProp);
      }
    }, [openProp, _open]);

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((current) => !current)
        : setOpen((current) => !current)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn("group/sidebar-wrapper flex h-full w-full", className)} // Ensure full height
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "icon" | "none" // Removed 'offcanvas' as mobile is handled by Sheet
  }
>(
  (
    {
      side = "left",
      variant = "sidebar", // Default to standard sidebar
      collapsible = "icon", // Default to icon collapsible for desktop
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, open, toggleSidebar } = useSidebar()

    if (collapsible === "none" && !isMobile) { // Non-collapsible desktop sidebar
      return (
        <aside
          className={cn(
            "flex h-full flex-col bg-sidebar text-sidebar-foreground shadow-md transition-all duration-300 ease-in-out",
            "w-[var(--sidebar-width)]",
            side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </aside>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className="w-[var(--sidebar-width-mobile)] bg-sidebar p-0 text-sidebar-foreground shadow-xl flex flex-col"
            style={{ ['--sidebar-width-mobile' as string]: SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
            closeIcon={false} // Remove default Sheet close icon, we'll add custom one
          >
             <SheetHeader className="p-3 border-b border-sidebar-border flex flex-row justify-between items-center">
              <SheetTitle className="text-lg font-semibold text-sidebar-primary">Menu</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop collapsible sidebar
    return (
      <aside
        ref={ref}
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        className={cn(
          "group hidden md:flex h-full flex-col bg-sidebar text-sidebar-foreground shadow-md transition-all duration-300 ease-in-out",
          state === "expanded" ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]",
          side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border",
          variant === "floating" && "m-2 rounded-lg shadow-xl",
          variant === "inset" && "border-0", // Inset might be part of main content area
          className
        )}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile, open } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 rounded-full text-foreground hover:bg-accent/30", className)} // Ensure consistent styling
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile, state } = useSidebar()

  if (isMobile) return null; // Rail is for desktop

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 cursor-pointer items-center justify-center transition-all duration-200 ease-linear group-data-[side=left]:right-0 group-data-[side=right]:left-0 group-data-[side=left]:translate-x-1/2 group-data-[side=right]:-translate-x-1/2 md:flex",
        "hover:bg-sidebar-accent/50 rounded-full",
        state === "expanded" ? "opacity-100" : "opacity-0 group-hover/sidebar-wrapper:opacity-100",
        className
      )}
      {...props}
    >
      <div className="h-8 w-1 rounded-full bg-sidebar-border group-hover:bg-sidebar-primary transition-colors"></div>
    </button>
  )
})
SidebarRail.displayName = "SidebarRail"

// This container wraps the main content area to the right (or left) of the sidebar
const SidebarInset = React.forwardRef<
  HTMLDivElement, // Changed from main to div for more flexibility
  React.ComponentProps<"div"> // Changed from main to div
>(({ className, ...props }, ref) => {
  const { isMobile, state, open } = useSidebar()
  
  return (
    <div // Changed from main to div
      ref={ref}
      className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out", // Ensure it fills remaining space and handles overflow
        // Desktop adjustments based on sidebar state (no longer relies on peer directly)
        // Mobile will always be full width as sidebar is a sheet
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-9 w-full bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60 shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-primary focus-visible:border-sidebar-primary",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-3 transition-all duration-300 ease-in-out group-data-[state=collapsed]:p-2", className)} // Adjusted padding for collapsed state
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-3 mt-auto border-t border-sidebar-border transition-all duration-300 ease-in-out group-data-[state=collapsed]:p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 my-1 w-auto bg-sidebar-border/70 transition-all duration-300 ease-in-out group-data-[state=collapsed]:mx-1", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex-grow min-h-0 flex flex-col gap-1 p-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent",
        "group-data-[state=collapsed]:items-center", // Center icons when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-1", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-primary focus-visible:ring-1",
        "group-data-[state=collapsed]:hidden", // Hide label when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-2 top-1.5 flex aspect-square w-6 items-center justify-center rounded-md p-0 text-sidebar-foreground/80 outline-none ring-sidebar-primary transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 [&>svg]:size-4",
        "group-data-[state=collapsed]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} // Reduced gap
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative w-full", className)} // Ensure full width for proper centering in collapsed mode
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-primary transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent/80 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:w-full group-data-[state=collapsed]:h-10 [&>span:last-child]:truncate group-data-[state=collapsed]:[&>span:last-child]:hidden [&>svg]:size-5 [&>svg]:shrink-0 group-data-[state=collapsed]:[&>svg]:size-6",
  {
    variants: {
      variant: {
        default: "",
        outline: "bg-transparent border border-sidebar-border shadow-sm hover:shadow-md",
      },
      size: { // Adjusted sizes for better visuals
        default: "h-10 text-sm",
        sm: "h-9 text-xs",
        lg: "h-12 text-base group-data-[state=collapsed]:h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children, // Added children to pass through
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state: sidebarState } = useSidebar() // Renamed state to sidebarState to avoid conflict

    const buttonContent = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    )

    if (!tooltip || (sidebarState === "expanded" && !isMobile) ) { // Hide tooltip if sidebar is expanded on desktop
      return buttonContent;
    }
    
    const tooltipProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          sideOffset={8}
          className="bg-background text-foreground border shadow-lg rounded-md px-2 py-1 text-xs"
          {...tooltipProps}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"


const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1.5 top-1/2 -translate-y-1/2 flex aspect-square w-6 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-primary transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 [&>svg]:size-4",
        "group-data-[state=collapsed]:hidden",
        showOnHover && "opacity-0 group-hover/menu-item:opacity-100 focus-within:opacity-100",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-xs font-medium tabular-nums text-sidebar-primary-foreground select-none pointer-events-none",
      "group-data-[state=collapsed]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = true, ...props }, ref) => {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-10 flex gap-3 px-2 items-center group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton className="size-5 rounded-md bg-sidebar-accent/50" data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[var(--skeleton-width)] bg-sidebar-accent/50 group-data-[state=collapsed]:hidden"
        data-sidebar="menu-skeleton-text"
        style={{ "--skeleton-width": width } as React.CSSProperties}
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "ml-5 flex min-w-0 translate-x-px flex-col gap-0.5 border-l border-sidebar-border/70 pl-3 py-1",
      "group-data-[state=collapsed]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement, // Assuming it's an anchor, adjust if button
  React.ComponentProps<"a"> & { // Assuming it's an anchor
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a" // Assuming 'a'

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-8 min-w-0 items-center gap-2.5 overflow-hidden rounded-md px-2 text-sidebar-foreground/90 outline-none ring-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent/80 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-primary",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs h-7",
        size === "md" && "text-sm h-8",
        "group-data-[state=collapsed]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
