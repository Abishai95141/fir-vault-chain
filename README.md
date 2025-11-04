# SecureFIR - Blockchain-Based FIR Filing System

A full-stack decentralized application for filing and managing First Information Reports (FIRs) using blockchain technology and IPFS for immutable, transparent record-keeping.

## 🚀 Features

- **Blockchain Integration**: Ethereum testnet (Polygon Mumbai) for immutable record hashing
- **Decentralized Storage**: IPFS for storing FIR data and evidence files
- **Hybrid Authentication**: Supabase email/password + Web3Auth wallet-based login
- **Role-Based Access**: Civilian (file & view own FIRs) and Police (admin access)
- **Encrypted Sensitive Data**: Client-side encryption for contact information
- **Public Verification**: Anyone can verify FIRs via blockchain explorer and IPFS gateway
- **Responsive Design**: Mobile-friendly interface with modern UI

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Blockchain**: Web3.js, Polygon Mumbai testnet
- **Storage**: IPFS via ipfs-http-client
- **Authentication**: Supabase, Web3Auth
- **Encryption**: CryptoJS
- **State Management**: React Query

## 📋 Prerequisites

- Node.js 16+ and npm
- MetaMask browser extension
- Supabase account (already configured)
- (Optional) Infura account for IPFS (or use public gateway)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <YOUR_GIT_URL>
cd securefir
npm install
```

### 2. Environment Configuration

The project is already connected to Supabase. No additional environment variables needed for local development.

For production IPFS usage, you may want to configure:
- Infura IPFS project credentials in `src/lib/ipfs-utils.ts`
- Custom RPC endpoints in `src/lib/web3-utils.ts`

### 3. Configure MetaMask

1. Install [MetaMask](https://metamask.io/)
2. Add Polygon Mumbai testnet:
   - Network Name: Polygon Mumbai
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: https://mumbai.polygonscan.com

3. Get test MATIC from [Mumbai Faucet](https://faucet.polygon.technology/)

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:8080`

## 📱 User Flows

### Civilian User

1. **Sign Up**: Register with email/password, select "Civilian" role
2. **Connect Wallet**: Link MetaMask for blockchain interactions
3. **File FIR**: 
   - Fill multi-step form with incident details
   - Upload evidence files
   - Submit to blockchain (triggers MetaMask signature)
4. **Track Status**: View submitted FIRs in dashboard (read-only)
5. **Verify**: Check any FIR status publicly via FIR ID

### Police Admin

1. **Sign Up**: Register with "Police" role
2. **Dashboard Access**: View all FIRs in system
3. **Manage FIRs**:
   - Search/filter by type, status, date
   - Update FIR status (triggers new blockchain transaction)
   - View decrypted sensitive data
4. **Audit Trail**: All actions logged to Supabase

## 🔐 Security Features

- **Client-Side Encryption**: Sensitive fields (email, phone) encrypted before IPFS upload
- **Immutable Records**: Blockchain hashing prevents tampering
- **Decentralized Storage**: No single point of failure with IPFS
- **Role-Based Access**: Supabase authentication with user metadata
- **Audit Logging**: All access/modifications tracked (configurable in Supabase)

## 🏗️ Architecture

```
┌─────────────┐
│   React UI  │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │ Web3.js  │  │   IPFS   │  │ CryptoJS │
│  Auth    │  │Blockchain│  │ Storage  │  │Encryption│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
                    │              │
                    ▼              ▼
              ┌──────────┐  ┌──────────┐
              │ Polygon  │  │  Infura  │
              │  Mumbai  │  │   IPFS   │
              └──────────┘  └──────────┘
```

## 📦 Key Files

- `src/lib/web3-utils.ts`: Blockchain interaction utilities
- `src/lib/ipfs-utils.ts`: IPFS upload/fetch functions
- `src/hooks/useWeb3.ts`: Web3 connection hook
- `src/hooks/useAuth.ts`: Supabase authentication hook
- `src/pages/FIRSubmission.tsx`: Multi-step FIR form
- `src/pages/StatusCheck.tsx`: Public FIR verification
- `src/pages/PoliceDashboard.tsx`: Admin management interface

## 🔄 Blockchain Flow

1. **FIR Submission**:
   ```
   User Data → Encrypt Sensitive → Upload to IPFS → Get CID
        ↓
   Generate FIR ID (SHA-256 hash) → Hash data → Sign transaction
        ↓
   Store CID + Hash on Blockchain → Return tx hash as FIR ID
   ```

2. **Status Check**:
   ```
   Input FIR ID → Query Blockchain by ID → Get CID from event
        ↓
   Fetch from IPFS by CID → Decrypt (if authorized) → Display
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables (if using custom IPFS/RPC)
4. Deploy!

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

## 🧪 Testing

For local testing without actual blockchain transactions:
- Mock transaction hashes are generated automatically
- IPFS uploads fallback to mock CIDs if Infura not configured
- Test with small files and sample data first

## 📝 Contract Deployment (Optional)

To deploy your own FIR smart contract:

1. Compile contract with Hardhat/Truffle
2. Deploy to Polygon Mumbai testnet
3. Update `FIR_CONTRACT_ADDRESS` in `src/lib/web3-utils.ts`
4. Update ABI if modified

Sample contract functions:
- `submitFIR(firId, dataCID, dataHash)`
- `updateFIRStatus(firId, status)`
- `getFIR(firId)` → returns CID, hash, status, timestamp, submitter

## 🔗 Useful Links

- [Project Dashboard](https://lovable.dev/projects/19204fc4-aedc-4983-9151-fb5b6e716d06)
- [Polygon Mumbai Explorer](https://mumbai.polygonscan.com)
- [IPFS Public Gateway](https://ipfs.io/ipfs/)
- [MetaMask Guide](https://metamask.io/faqs/)
- [Supabase Docs](https://supabase.com/docs)

## 🐛 Known Limitations

- **Demo Mode**: Without deployed contract, uses mock tx hashes
- **IPFS Pinning**: Public gateway may not persist files long-term (use Pinata/Infura for production)
- **Email Verification**: Disable "Confirm email" in Supabase settings for faster testing

## 🤝 Contributing

This is a demonstration project. For production use:
- Deploy actual smart contract to mainnet
- Set up IPFS pinning service (Pinata, Infura, Web3.Storage)
- Implement proper key management for encryption
- Add comprehensive error handling and logging
- Set up monitoring and analytics

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check [Lovable documentation](https://docs.lovable.dev/)
- Review [Supabase guides](https://supabase.com/docs/guides)

---

**Built with ❤️ using Lovable, React, Blockchain, and IPFS**
