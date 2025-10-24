import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { privateKeyToAccount } from 'viem/accounts';
import { Uploader } from '@irys/upload';
import { BaseEth } from '@irys/upload-ethereum';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Irys uploader
let irysUploader = null;
let irysAccount = null;

// --- 🔹 Setup Irys uploader and show the paying wallet ---
async function getIrysUploader() {
  if (!irysUploader) {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('IRYS_PRIVATE_KEY environment variable is not set');
    }

    // This is the wallet that pays for uploads
    irysAccount = privateKeyToAccount(privateKey);
    console.log("💳 Irys wallet address (payer):", irysAccount.address);

    irysUploader = await Uploader(BaseEth).withWallet(privateKey);
  }

  return irysUploader;
}

// --- 🩵 Check balance endpoint ---
app.get('/api/irys-balance', async (req, res) => {
  try {
    const uploader = await getIrysUploader();
    const balance = await uploader.getLoadedBalance();

    res.json({
      address: irysAccount.address,
      balance: balance.toString(),
      message: 'This is the Irys wallet that pays for all uploads.'
    });
  } catch (error) {
    console.error('Error getting Irys balance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'irys-upload-service' });
});

// Upload vote endpoint
app.post('/api/upload-vote', async (req, res) => {
  try {
    const { voteData } = req.body;

    if (!voteData) {
      return res.status(400).json({ error: 'voteData is required' });
    }

    const uploader = await getIrysUploader();

    // Prepare vote data for blockchain storage
    const blockchainVoteData = {
      id: voteData.id,
      projectId: voteData.project_id,
      walletAddress: voteData.wallet_address,
      timestamp: voteData.created_at,
      type: 'vote'
    };

    // Create tags for better organization
    const tags = [
      { name: "application-id", value: "ProjectVotingApp" },
      { name: "data-type", value: "vote" },
      { name: "project-id", value: String(voteData.project_id) },
      { name: "wallet-address", value: String(voteData.wallet_address) },
      { name: "Content-Type", value: "application/json" }
    ];

    // Upload to Irys
    const receipt = await uploader.upload(JSON.stringify(blockchainVoteData), { tags });

    console.log(`✅ Vote uploaded to Irys: https://gateway.irys.xyz/${receipt.id}`);

    res.json({
      success: true,
      irysId: receipt.id,
      gatewayUrl: `https://gateway.irys.xyz/${receipt.id}`
    });
  } catch (error) {
    console.error('Error uploading vote to Irys:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload feedback endpoint
app.post('/api/upload-feedback', async (req, res) => {
  try {
    const { feedbackData } = req.body;

    if (!feedbackData) {
      return res.status(400).json({ error: 'feedbackData is required' });
    }

    const uploader = await getIrysUploader();

    // Prepare feedback data for blockchain storage
    const blockchainFeedbackData = {
      id: feedbackData.id,
      projectId: feedbackData.project_id,
      walletAddress: feedbackData.wallet_address,
      title: feedbackData.title,
      content: feedbackData.content,
      timestamp: feedbackData.created_at,
      type: 'feedback'
    };

    // Create tags for better organization
    const tags = [
      { name: "application-id", value: "ProjectVotingApp" },
      { name: "data-type", value: "feedback" },
      { name: "project-id", value: String(feedbackData.project_id) },
      { name: "wallet-address", value: String(feedbackData.wallet_address) },
      { name: "has-content", value: feedbackData.content ? "true" : "false" },
      { name: "Content-Type", value: "application/json" }
    ];

    // Upload to Irys
    const receipt = await uploader.upload(JSON.stringify(blockchainFeedbackData), { tags });

    console.log(`✅ Feedback uploaded to Irys: https://gateway.irys.xyz/${receipt.id}`);

    res.json({
      success: true,
      irysId: receipt.id,
      gatewayUrl: `https://gateway.irys.xyz/${receipt.id}`
    });
  } catch (error) {
    console.error('Error uploading feedback to Irys:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Irys upload service running on port ${PORT}`);
});