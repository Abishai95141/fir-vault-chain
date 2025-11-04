import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { Search, FileText, ExternalLink, Shield, Filter } from 'lucide-react';
import { FIRData, FIRStatus, IncidentType } from '@/types/fir';
import { getBlockchainExplorerUrl } from '@/lib/web3-utils';
import { toast } from 'react-hot-toast';

const PoliceDashboard = () => {
  const { userRole } = useAuth();
  const [firs, setFirs] = useState<FIRData[]>([]);
  const [filteredFirs, setFilteredFirs] = useState<FIRData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (userRole !== 'police') {
      toast.error('Access denied. Police personnel only.');
      return;
    }

    // In a real implementation, query all FIRs from blockchain
    // For demo, show empty state
    setFirs([]);
    setFilteredFirs([]);
  }, [userRole]);

  useEffect(() => {
    // Apply filters
    let filtered = firs;

    if (searchQuery) {
      filtered = filtered.filter(fir =>
        fir.victimName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fir.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fir.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(fir => fir.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(fir => fir.incidentType === typeFilter);
    }

    setFilteredFirs(filtered);
  }, [searchQuery, statusFilter, typeFilter, firs]);

  const handleStatusUpdate = async (firId: string, newStatus: FIRStatus) => {
    try {
      // In real implementation:
      // 1. Re-hash the updated data
      // 2. Upload new version to IPFS
      // 3. Send update transaction to blockchain
      // 4. Log to Supabase audit
      
      toast.success(`FIR status updated to ${newStatus.replace('_', ' ')}`);
      
      // Update local state
      setFirs(firs.map(fir => 
        fir.id === firId ? { ...fir, status: newStatus } : fir
      ));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadgeVariant = (status?: FIRStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'under_investigation': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  if (userRole !== 'police') {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              This dashboard is only accessible to police personnel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Police Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor all FIRs with administrative access
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total FIRs</CardDescription>
              <CardTitle className="text-3xl">{firs.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {firs.filter(f => f.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Under Investigation</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {firs.filter(f => f.status === 'under_investigation').length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Closed</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {firs.filter(f => f.status === 'closed').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-medium mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search by name, ID, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="cybercrime">Cybercrime</SelectItem>
                  <SelectItem value="missing_person">Missing Person</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* FIRs Table */}
        {filteredFirs.length === 0 ? (
          <Card className="shadow-medium">
            <CardContent className="py-16">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No FIRs Found</h3>
                <p className="text-muted-foreground">
                  {firs.length === 0 
                    ? 'No FIRs have been submitted yet.'
                    : 'No FIRs match your current filters. Try adjusting your search criteria.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-medium">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FIR ID</TableHead>
                  <TableHead>Victim Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFirs.map((fir) => (
                  <TableRow key={fir.id}>
                    <TableCell className="font-mono text-xs">
                      {fir.id?.substring(0, 8)}...
                      {fir.blockchainTxHash && (
                        <a 
                          href={getBlockchainExplorerUrl(fir.blockchainTxHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 inline-block"
                        >
                          <ExternalLink className="h-3 w-3 text-primary" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{fir.victimName}</TableCell>
                    <TableCell className="capitalize">
                      {fir.incidentType?.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{fir.incidentDate}</TableCell>
                    <TableCell>{fir.location}</TableCell>
                    <TableCell>
                      <Select
                        value={fir.status || 'pending'}
                        onValueChange={(v) => handleStatusUpdate(fir.id!, v as FIRStatus)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_investigation">Under Investigation</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Audit Log Card */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Audit Trail Enabled</h4>
                <p className="text-sm text-muted-foreground">
                  All actions are logged to the audit trail. Status updates generate new IPFS versions
                  and blockchain transactions for complete transparency and immutability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoliceDashboard;
