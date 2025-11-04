import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/hooks/useWeb3';
import { Shield, Wallet, Mail } from 'lucide-react';
import { UserRole } from '@/types/fir';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('civilian');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { connect } = useWeb3();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, role);
      } else {
        await signIn(email, password);
        navigate(role === 'police' ? '/police-dashboard' : '/civilian-dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setLoading(true);
    try {
      const address = await connect();
      toast.success('Wallet connected! Please also sign in with email.');
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to SecureFIR</CardTitle>
          <CardDescription>
            Secure blockchain-based FIR filing system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(v) => setIsSignUp(v === 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? 'Signing in...' : 'Sign In with Email'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="civilian" id="civilian" />
                      <Label htmlFor="civilian" className="font-normal cursor-pointer">
                        Civilian (File and view own FIRs)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="police" id="police" />
                      <Label htmlFor="police" className="font-normal cursor-pointer">
                        Police (Admin access to all FIRs)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? 'Creating account...' : 'Sign Up with Email'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleWalletConnect}
            disabled={loading}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect with MetaMask
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="text-primary hover:underline">
              Back to Home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
