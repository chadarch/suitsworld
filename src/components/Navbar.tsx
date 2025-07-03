import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "./AuthProvider";

const Navbar = () => {
  const [cartItems] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg lg:text-xl">SW</span>
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-slate-900">The Suits World</h1>
              <p className="text-xs text-gray-600 hidden sm:block">Premium Formal Wear</p>
            </div>
          </Link>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-900">Men's</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-96">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-slate-900 mb-3">Suits</h4>
                          <ul className="space-y-2 text-sm">
                            <li>
                              <Link to="/mens/corporate-suits" className="text-gray-600 hover:text-slate-900 block">
                                Corporate Suits
                              </Link>
                            </li>
                            <li>
                              <Link to="/mens/wedding-suits" className="text-gray-600 hover:text-slate-900 block">
                                Wedding Suits
                              </Link>
                            </li>
                            <li>
                              <Link to="/mens/prom-suits" className="text-gray-600 hover:text-slate-900 block">
                                Prom Suits
                              </Link>
                            </li>
                            <li>
                              <Link to="/mens/three-piece-suits" className="text-gray-600 hover:text-slate-900 block">
                                Three-Piece Suits
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 mb-3">Accessories</h4>
                          <ul className="space-y-2 text-sm">
                            <li>
                              <Link to="/mens/blazers" className="text-gray-600 hover:text-slate-900 block">
                                Blazers
                              </Link>
                            </li>
                            <li>
                              <Link to="/mens/formal-trousers" className="text-gray-600 hover:text-slate-900 block">
                                Formal Trousers
                              </Link>
                            </li>
                            <li>
                              <Link to="/mens/ties-accessories" className="text-gray-600 hover:text-slate-900 block">
                                Ties & Accessories
                              </Link>
                            </li>
                            <li>
                              <Link to="/mens/formal-shoes" className="text-gray-600 hover:text-slate-900 block">
                                Formal Shoes
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-900">Women's</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-96">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-slate-900 mb-3">Suits</h4>
                          <ul className="space-y-2 text-sm">
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Business Suits
                              </Link>
                            </li>
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Wedding Suits
                              </Link>
                            </li>
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Cocktail Suits
                              </Link>
                            </li>
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Skirt Suits
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 mb-3">Collection</h4>
                          <ul className="space-y-2 text-sm">
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Blazer Sets
                              </Link>
                            </li>
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Formal Dresses
                              </Link>
                            </li>
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Accessories
                              </Link>
                            </li>
                            <li>
                              <Link to="/womens" className="text-gray-600 hover:text-slate-900 block">
                                Formal Shoes
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/childrens" className="text-slate-900 hover:text-slate-700 px-4 py-2">
                      Children's
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/sale" className="text-slate-900 hover:text-slate-700 px-4 py-2">
                      Sale
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Input 
                placeholder="Search suits..." 
                className="w-48 lg:w-64 pl-10 border-gray-300 focus:border-slate-900"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2 relative">
              {user ? (
                <div className="relative">
                  <Button variant="ghost" size="sm" className="text-slate-900 flex items-center gap-2" onClick={() => setDropdownOpen((v) => !v)}>
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline">{user.username}</span>
                  </Button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                      <div className="px-4 py-2 border-b text-sm text-slate-700">Signed in as <b>{user.username}</b></div>
                      <div className="px-4 py-2 text-sm text-slate-700">{user.email}</div>
                      <button
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t text-sm"
                        onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="text-slate-900">
                    <Link to="/signin">Sign In</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="text-slate-900">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" className="text-slate-900 relative">
                <ShoppingBag className="w-5 h-5" />
                {cartItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {cartItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button variant="ghost" size="sm" className="text-slate-900">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-900 relative">
              <ShoppingBag className="w-5 h-5" />
              {cartItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                  {cartItems}
                </Badge>
              )}
            </Button>
            
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-900">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-slate-900">Menu</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Search Bar Mobile */}
                  <div className="relative">
                    <Input 
                      placeholder="Search suits..." 
                      className="w-full pl-10 border-gray-300 focus:border-slate-900"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Men's</h3>
                      <ul className="space-y-2 ml-4">
                        <li><Link to="/mens/corporate-suits" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Corporate Suits</Link></li>
                        <li><Link to="/mens/wedding-suits" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Wedding Suits</Link></li>
                        <li><Link to="/mens/prom-suits" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Prom Suits</Link></li>
                        <li><Link to="/mens/three-piece-suits" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Three-Piece Suits</Link></li>
                        <li><Link to="/mens/blazers" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Blazers</Link></li>
                        <li><Link to="/mens/formal-trousers" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Formal Trousers</Link></li>
                        <li><Link to="/mens/ties-accessories" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Ties & Accessories</Link></li>
                        <li><Link to="/mens/formal-shoes" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Formal Shoes</Link></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Women's</h3>
                      <ul className="space-y-2 ml-4">
                        <li><Link to="/womens" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Business Suits</Link></li>
                        <li><Link to="/womens" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Wedding Suits</Link></li>
                        <li><Link to="/womens" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Cocktail Suits</Link></li>
                        <li><Link to="/womens" className="text-gray-600 hover:text-slate-900 block" onClick={() => setIsMobileMenuOpen(false)}>Formal Dresses</Link></li>
                      </ul>
                    </div>

                    <div>
                      <Link to="/childrens" className="font-semibold text-slate-900 hover:text-slate-700 block" onClick={() => setIsMobileMenuOpen(false)}>
                        Children's
                      </Link>
                    </div>

                    <div>
                      <Link to="/sale" className="font-semibold text-slate-900 hover:text-slate-700 block" onClick={() => setIsMobileMenuOpen(false)}>
                        Sale
                      </Link>
                    </div>
                  </div>

                  {/* User Account */}
                  <div className="border-t pt-4">
                    {user ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                          <User className="w-5 h-5" />
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">{user.email}</div>
                        <Button variant="ghost" className="w-full justify-start text-red-600" onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}>
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button asChild variant="ghost" className="w-full justify-start text-slate-900">
                          <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start text-slate-900">
                          <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Admin Portal Link */}
                  <div className="border-t pt-4 text-sm text-gray-600">
                    <Link to="/admin" className="text-slate-900 hover:text-yellow-600 transition-colors">
                      Admin Portal
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
