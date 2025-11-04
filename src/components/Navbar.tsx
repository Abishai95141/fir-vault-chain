import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/hooks/useWeb3';
import { Shield, LogOut, User, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const { user, userRole, signOut } = useAuth();
  const { account, isConnected, connect, disconnect } = useWeb3();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    if (isConnected) disconnect();
    navigate('/');
  };

  return (
    <nav className="border-b bg-card shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              SecureFIR
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to={userRole === 'police' ? '/police-dashboard' : '/civilian-dashboard'}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                
                <Link to="/status-check">
                  <Button variant="ghost">Check Status</Button>
                </Link>

                {!isConnected && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={connect}
                    className="gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                      Role: {userRole}
                    </DropdownMenuLabel>
                    {isConnected && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                          <Wallet className="h-3 w-3 inline mr-1" />
                          {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={disconnect}>
                          Disconnect Wallet
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button variant="hero">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
