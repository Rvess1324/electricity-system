import { Link, usePage } from '@inertiajs/react';
import {
    Bookmark,
    ClipboardList,
    Gauge,
    LayoutGrid,
    Lightbulb,
    Plug,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';

    const role = (
        page.props.auth?.user as unknown as { role?: string } | undefined
    )?.role;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(role === 'household'
            ? [
                  {
                      title: 'Appliances',
                      href: '/household/appliances',
                      icon: Plug,
                  },
                  { title: 'Meters', href: '/household/meters', icon: Gauge },
                  {
                      title: 'Energy Plans',
                      href: '/household/plans',
                      icon: ClipboardList,
                  },
                  {
                      title: 'Energy Tips',
                      href: '/household/tips',
                      icon: Lightbulb,
                  },
                  {
                      title: 'Saved Tips',
                      href: '/household/saved-tips',
                      icon: Bookmark,
                  },
                  {
                      title: 'Service Requests',
                      href: '/household/requests',
                      icon: Wrench,
                  },
              ]
            : []),
        ...(role === 'admin'
            ? [
                  {
                      title: 'Energy Tips',
                      href: '/admin/tips',
                      icon: Lightbulb,
                  },
                  {
                      title: 'Service Requests',
                      href: '/admin/requests',
                      icon: Wrench,
                  },
              ]
            : []),
        ...(role === 'electrician'
            ? [
                  {
                      title: 'My Requests',
                      href: '/electrician/requests',
                      icon: Wrench,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
