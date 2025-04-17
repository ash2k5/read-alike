
import { BookOpen, User, Search, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { currentUser } from "@/data/mockData";

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-book-purple" />
              <span className="font-bold text-xl text-gray-900">ReadAlike</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-10">
            <NavLink href="/" isActive={isActive("/")} icon={<Home size={18} />}>
              Home
            </NavLink>
            <NavLink href="/browse" isActive={isActive("/browse")} icon={<BookOpen size={18} />}>
              Browse
            </NavLink>
            <NavLink href="/search" isActive={isActive("/search")} icon={<Search size={18} />}>
              Search
            </NavLink>
            {currentUser ? (
              <NavLink href="/my-books" isActive={isActive("/my-books")} icon={<User size={18} />}>
                My Books
              </NavLink>
            ) : (
              <NavLink href="/login" isActive={isActive("/login")} icon={<User size={18} />}>
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2">
            <MobileNavLink href="/" isActive={isActive("/")} icon={<Home size={20} />}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/browse" isActive={isActive("/browse")} icon={<BookOpen size={20} />}>
              Browse
            </MobileNavLink>
            <MobileNavLink href="/search" isActive={isActive("/search")} icon={<Search size={20} />}>
              Search
            </MobileNavLink>
            {currentUser ? (
              <MobileNavLink href="/my-books" isActive={isActive("/my-books")} icon={<User size={20} />}>
                Profile
              </MobileNavLink>
            ) : (
              <MobileNavLink href="/login" isActive={isActive("/login")} icon={<User size={20} />}>
                Login
              </MobileNavLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavLink({ href, isActive, icon, children }: NavLinkProps) {
  return (
    <Link
      to={href}
      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "text-book-purple-dark bg-book-purple/10"
          : "text-gray-700 hover:text-book-purple hover:bg-gray-50"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({ href, isActive, icon, children }: NavLinkProps) {
  return (
    <Link
      to={href}
      className={`flex flex-col items-center justify-center py-1 px-3 rounded-md text-xs ${
        isActive
          ? "text-book-purple font-medium"
          : "text-gray-600"
      }`}
    >
      {icon}
      <span className="mt-1">{children}</span>
    </Link>
  );
}
