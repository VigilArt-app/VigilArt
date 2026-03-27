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

import { Palette, User, LayoutDashboard, LogOut } from "lucide-react"
import { useTranslation } from "react-i18next";


export function AppSidebar() {
  const { t } = useTranslation();
  const items = [
    {
      title: t("sidebar.profile"),
      url: "/profile",
      icon: User,
    },
    {
      title: t("sidebar.dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("sidebar.artwork_gallery"),
      url: "/artwork-gallery",
      icon: Palette,
    },
  ]
  
  const logout_items = [
    {
      title: t("sidebar.logout"),
      url: "/logout",
      icon: LogOut,
    },
  ]
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
      <SidebarMenu>
        {logout_items.map((item) => (
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
      <SidebarFooter>
        <div className="w-full flex items-center justify-center py-4">
          {t("sidebar.upgrade")}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
