"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [{ href: "/customers", label: "Customers" }];

const Navbar = () => {
    const pathname = usePathname();
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center gap-6">
                {/* Logo */}
                <Link
                    href="/customers"
                    className="flex items-center gap-2 font-semibold text-foreground"
                >
                    <Users className="h-5 w-5" />
                    <span>CMS</span>
                </Link>

                {/* Nav links */}
                <nav className="flex items-center gap-4 text-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname.startsWith(link.href)
                                    ? "text-foreground font-medium"
                                    : "text-foreground/60",
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
