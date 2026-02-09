import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'

interface NavbarProps {
  variant?: 'landing' | 'app'
}

/**
 * Navbar component - Reusable navigation bar for both landing and app pages
 *
 * @param variant - 'landing' shows full navigation links, 'app' shows simplified version
 */
export function Navbar({ variant = 'landing' }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <TrendingUp className="h-6 w-6" />
          <span>FinReady</span>
        </Link>

        {/* Navigation Links */}
        {variant === 'landing' && (
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#ai"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              AI Insights
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <Link to="/app">
              <Button size="sm">
                Try Now
              </Button>
            </Link>
          </div>
        )}

        {variant === 'app' && (
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile Menu Button - Could be expanded with a mobile menu */}
        {variant === 'landing' && (
          <div className="md:hidden">
            <Link to="/app">
              <Button size="sm">
                Try Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
