import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchFromIPFS, getIPFSGatewayUrl } from '@/lib/ipfs-utils';
import { queryFIRFromBlockchain, getBlockchainExplorerUrl, decryptSensitiveData } from '@/lib/web3-utils';
import { useAuth } from '@/hooks/useAuth';
import { Search, ExternalLink, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FIRData, FIRStatus } from '@/types/fir';

const StatusCheck = () => {
  const { userRole } = useAuth();
  const [firId, setFirId] = useState('');
  const [loading, setLoading] = useState(false);
  const [firData, setFirData] = useState<FIRData | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const getStatusBadgeVariant = (status?: FIRStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'under_investigation': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const handleSearch = async () => {
    if (!firId.trim()) {
      toast.error('Please enter a FIR ID');
      return;
    }

    setLoading(true);
    setFirData(null);

    try {
      // Try fetching from blockchain first
      const blockchainData = await queryFIRFromBlockchain(firId);
      
      if (blockchainData && blockchainData.dataCID) {
        // Fetch full data from IPFS
        const ipfsData = await fetchFromIPFS(blockchainData.dataCID);
        
        setFirData({
          ...ipfsData,
          id: firId,
          ipfsCID: blockchainData.dataCID,
          blockchainTxHash: firId
        });
        
        toast.success('FIR found and verified!');
      } else {
        // Try direct CID lookup
        try {
          const directData = await fetchFromIPFS(firId);
          setFirData({
            ...directData,
            id: firId,
            ipfsCID: firId
          });
          toast.success('FIR found on IPFS');
        } catch (error) {
          toast.error('FIR not found. Please check the ID and try again.');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to retrieve FIR. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSensitiveData = () => {
    if (userRole !== 'police') {
      toast.error('Only police personnel can view sensitive data');
      return;
    }
    setShowSensitive(!showSensitive);
  };

  const renderSensitiveField = (encrypted: string, label: string) => {
    if (showSensitive && userRole === 'police') {
      try {
        return decryptSensitiveData(encrypted);
      } catch {
        return '****** (Decryption failed)';
      }
    }
    return '****** (Hidden)';
  };

  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-medium mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Search className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Check FIR Status</CardTitle>
            </div>
            <CardDescription>
              Enter FIR ID (transaction hash or IPFS CID) to retrieve details
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="firId" className="sr-only">FIR ID</Label>
                <Input
                  id="firId"
                  placeholder="Enter FIR ID (0x... or Qm...)"
                  value={firId}
                  onChange={(e) => setFirId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {firData && (
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>FIR Details</CardTitle>
                <Badge variant={getStatusBadgeVariant(firData.status)}>
                  {firData.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                This record is decentralized and tamper-proof
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Blockchain Verification */}
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <h3 className="font-semibold text-success mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Blockchain Verification
                </h3>
                <div className="space-y-2 text-sm">
                  {firData.blockchainTxHash && (
                    <div>
                      <span className="text-muted-foreground">Transaction Hash: </span>
                      <a 
                        href={getBlockchainExplorerUrl(firData.blockchainTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {firData.blockchainTxHash.substring(0, 10)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {firData.ipfsCID && (
                    <div>
                      <span className="text-muted-foreground">IPFS CID: </span>
                      <a 
                        href={getIPFSGatewayUrl(firData.ipfsCID)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {firData.ipfsCID.substring(0, 10)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* FIR Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Victim Name</Label>
                  <p className="font-medium">{firData.victimName}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Incident Type</Label>
                  <p className="font-medium capitalize">{firData.incidentType?.replace('_', ' ')}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Contact Email</Label>
                  <p className="font-medium">
                    {renderSensitiveField(firData.contactEmail || '', 'Email')}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Contact Phone</Label>
                  <p className="font-medium">
                    {renderSensitiveField(firData.contactPhone || '', 'Phone')}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Incident Date</Label>
                  <p className="font-medium">{firData.incidentDate} {firData.incidentTime}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{firData.location}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Incident Description</Label>
                <p className="mt-1 text-sm">{firData.incidentDescription}</p>
              </div>

              {firData.witnesses && firData.witnesses.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Witnesses</Label>
                  <ul className="mt-1 space-y-1">
                    {firData.witnesses.map((witness, idx) => (
                      <li key={idx} className="text-sm">
                        {witness.name} - {witness.contact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {firData.createdAt && (
                <div>
                  <Label className="text-muted-foreground">Submitted On</Label>
                  <p className="text-sm">{new Date(firData.createdAt).toLocaleString()}</p>
                </div>
              )}

              {userRole === 'police' && (
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleSensitiveData}
                  >
                    {showSensitive ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Sensitive Data
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Show Sensitive Data
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StatusCheck;
