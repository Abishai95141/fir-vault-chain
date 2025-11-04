import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3 } from '@/hooks/useWeb3';
import { uploadToIPFS, uploadMultipleFilesToIPFS } from '@/lib/ipfs-utils';
import { generateFIRId, hashData, encryptSensitiveData, submitFIRToBlockchain, getBlockchainExplorerUrl } from '@/lib/web3-utils';
import { FIRData, IncidentType, Witness } from '@/types/fir';
import { toast } from 'react-hot-toast';
import { FileUp, Plus, X, Shield, Loader2 } from 'lucide-react';

const FIRSubmission = () => {
  const { user, userRole } = useAuth();
  const { account, isConnected, connect } = useWeb3();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [witnesses, setWitnesses] = useState<Witness[]>([{ name: '', contact: '' }]);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<Partial<FIRData>>({
    victimName: '',
    contactEmail: '',
    contactPhone: '',
    incidentType: 'theft',
    incidentDescription: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
  });

  const handleInputChange = (field: keyof FIRData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', contact: '' }]);
  };

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const updateWitness = (index: number, field: keyof Witness, value: string) => {
    const updated = [...witnesses];
    updated[index][field] = value;
    setWitnesses(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const validateStep1 = () => {
    if (!formData.victimName || !formData.contactEmail || !formData.contactPhone) {
      toast.error('Please fill in all personal information');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail || '')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.incidentType || !formData.incidentDescription || !formData.incidentDate || !formData.incidentTime || !formData.location) {
      toast.error('Please fill in all incident details');
      return false;
    }
    
    const selectedDate = new Date(formData.incidentDate + ' ' + formData.incidentTime);
    if (selectedDate > new Date()) {
      toast.error('Incident date cannot be in the future');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit FIR');
      navigate('/login');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      try {
        await connect();
      } catch (error) {
        return;
      }
    }

    setLoading(true);
    const toastId = toast.loading('Submitting FIR to blockchain...');

    try {
      // Prepare FIR data with encrypted sensitive fields
      const encryptedEmail = encryptSensitiveData(formData.contactEmail || '');
      const encryptedPhone = encryptSensitiveData(formData.contactPhone || '');
      
      const firDataForIPFS = {
        ...formData,
        contactEmail: encryptedEmail,
        contactPhone: encryptedPhone,
        witnesses: witnesses.filter(w => w.name || w.contact),
        submittedBy: user.id,
        walletAddress: account || '',
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Upload files to IPFS
      let fileCIDs: string[] = [];
      if (files.length > 0) {
        toast.loading('Uploading evidence files to IPFS...', { id: toastId });
        fileCIDs = await uploadMultipleFilesToIPFS(files);
      }

      // Upload FIR data to IPFS
      toast.loading('Uploading FIR data to IPFS...', { id: toastId });
      const dataCID = await uploadToIPFS({ ...firDataForIPFS, evidenceFiles: fileCIDs });
      
      // Generate FIR ID
      const firId = generateFIRId(firDataForIPFS);
      const dataHash = hashData(firDataForIPFS);

      // Submit to blockchain
      toast.loading('Recording on blockchain...', { id: toastId });
      const txHash = await submitFIRToBlockchain(firId, dataCID, dataHash, account || '');

      toast.success('FIR submitted successfully!', { id: toastId });

      // Show success modal with details
      setTimeout(() => {
        toast.success(
          <div>
            <p className="font-semibold">FIR ID: {firId}</p>
            <a 
              href={getBlockchainExplorerUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              View on Explorer
            </a>
          </div>,
          { duration: 10000 }
        );
      }, 500);

      // Navigate to dashboard
      setTimeout(() => {
        navigate(userRole === 'police' ? '/police-dashboard' : '/civilian-dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit FIR', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-medium">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">File New FIR</CardTitle>
            </div>
            <CardDescription>
              All information is encrypted and stored on IPFS with blockchain verification
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`h-1 w-12 ${
                      step > s ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="victimName">Victim's Full Name *</Label>
                  <Input
                    id="victimName"
                    value={formData.victimName}
                    onChange={(e) => handleInputChange('victimName', e.target.value)}
                    placeholder="Enter full name"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="email@example.com"
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground">Will be encrypted before storage</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                    maxLength={15}
                  />
                  <p className="text-xs text-muted-foreground">Will be encrypted before storage</p>
                </div>

                <Button onClick={handleNext} className="w-full">
                  Next Step
                </Button>
              </div>
            )}

            {/* Step 2: Incident Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Incident Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type *</Label>
                  <Select 
                    value={formData.incidentType}
                    onValueChange={(v) => handleInputChange('incidentType', v as IncidentType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  <Label htmlFor="incidentDescription">Incident Description *</Label>
                  <Textarea
                    id="incidentDescription"
                    value={formData.incidentDescription}
                    onChange={(e) => handleInputChange('incidentDescription', e.target.value)}
                    placeholder="Provide detailed description of the incident"
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.incidentDescription?.length || 0}/1000 characters
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incidentDate">Date of Incident *</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incidentTime">Time of Incident *</Label>
                    <Input
                      id="incidentTime"
                      type="time"
                      value={formData.incidentTime}
                      onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter incident location"
                    maxLength={200}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Witnesses and Evidence */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Witnesses & Evidence</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Witnesses (Optional)</Label>
                    <Button variant="outline" size="sm" onClick={addWitness}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Witness
                    </Button>
                  </div>

                  {witnesses.map((witness, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Witness name"
                        value={witness.name}
                        onChange={(e) => updateWitness(index, 'name', e.target.value)}
                        maxLength={100}
                      />
                      <Input
                        placeholder="Contact"
                        value={witness.contact}
                        onChange={(e) => updateWitness(index, 'contact', e.target.value)}
                        maxLength={50}
                      />
                      {witnesses.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeWitness(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidence">Evidence Files (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      id="evidence"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="evidence" className="cursor-pointer">
                      <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Images, PDFs, documents
                      </p>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {files.length} file(s) selected
                    </div>
                  )}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Your FIR will be encrypted, stored on IPFS, and hashed on the blockchain for immutability and transparency.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit FIR'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FIRSubmission;
