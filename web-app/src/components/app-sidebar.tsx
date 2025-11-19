import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "../components/ui/sidebar"
import Image from "next/image";
import Link from "next/link";

import { Palette, User, LayoutDashboard  } from "lucide-react"

const items = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Artwork Gallery",
    url: "/artwork-gallery",
    icon: Palette,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="w-full flex items-center justify-center py-4">
          <Image src="/vigilart_b.png" alt="VigilArt logo" width={100} height={100} className="invert-0 dark:invert" priority />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="shrink-0 basis-1/4" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-5">
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="w-full flex items-center justify-center py-4">
          Upgrade to Pro
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
