import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Search, Lock, Database, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="h-5 w-5 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                Blockchain-Powered FIR System
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Secure, Transparent, Immutable
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              File First Information Reports (FIRs) on the blockchain with complete transparency. 
              Your records are tamper-proof, decentralized, and accessible anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/fir-submission">
                <Button size="lg" variant="accent" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-5 w-5" />
                  File New FIR
                </Button>
              </Link>
              <Link to="/status-check">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 bg-white/10 text-primary-foreground hover:bg-white/20">
                  <Search className="mr-2 h-5 w-5" />
                  Check FIR Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose SecureFIR?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Leveraging blockchain and IPFS for a transparent, secure, and decentralized FIR management system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-soft border border-border">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Immutable Records</h3>
              <p className="text-muted-foreground">
                Once submitted, FIRs are stored on the blockchain and IPFS, making them tamper-proof and permanent.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-soft border border-border">
              <div className="h-12 w-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Decentralized Storage</h3>
              <p className="text-muted-foreground">
                All FIR data is stored on IPFS with only hashes on-chain, ensuring no central point of failure.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-soft border border-border">
              <div className="h-12 w-12 rounded-lg bg-success flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Public Verification</h3>
              <p className="text-muted-foreground">
                Anyone can verify the authenticity of an FIR using the blockchain explorer and IPFS gateway.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Simple, transparent process for filing and tracking FIRs
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Submit FIR Details</h3>
                <p className="text-muted-foreground">
                  Fill out the secure form with incident details. Sensitive information is encrypted before storage.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload to IPFS</h3>
                <p className="text-muted-foreground">
                  Your FIR data and documents are uploaded to IPFS, receiving a unique Content Identifier (CID).
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Hash on Blockchain</h3>
                <p className="text-muted-foreground">
                  A cryptographic hash of your FIR is recorded on the Ethereum blockchain with the IPFS CID.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Track & Verify</h3>
                <p className="text-muted-foreground">
                  Use your FIR ID to check status, retrieve details from IPFS, and verify authenticity on the blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to File Your FIR?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join the transparent, secure future of law enforcement reporting
          </p>
          <Link to="/login">
            <Button size="lg" variant="hero">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
