import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

async function getIrysUploader() {
  if (!irysUploader) {
    const privateKey = process.env.IRYS_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('IRYS_PRIVATE_KEY environment variable is not set');
    }
    irysUploader = await Uploader(BaseEth).withWallet(privateKey);
  }
  return irysUploader;
}

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
      userId: voteData.user_id,
      timestamp: voteData.created_at,
      type: 'vote'
    };
    
    // Create tags for better organization
    const tags = [
      { name: "application-id", value: "ProjectVotingApp" },
      { name: "data-type", value: "vote" },
      { name: "project-id", value: voteData.project_id },
      { name: "user-id", value: voteData.user_id },
      { name: "Content-Type", value: "application/json" }
    ];
    
    // Upload to Irys
    const receipt = await uploader.upload(JSON.stringify(blockchainVoteData), { tags });
    
    console.log(`Vote uploaded to Irys: https://gateway.irys.xyz/${receipt.id}`);
    
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
      userId: feedbackData.user_id,
      title: feedbackData.title,
      timestamp: feedbackData.created_at,
      type: 'feedback'
    };
    
    // Create tags for better organization
    const tags = [
      { name: "application-id", value: "ProjectVotingApp" },
      { name: "data-type", value: "feedback" },
      { name: "project-id", value: feedbackData.project_id },
      { name: "user-id", value: feedbackData.user_id },
      { name: "Content-Type", value: "application/json" }
    ];
    
    // Upload to Irys
    const receipt = await uploader.upload(JSON.stringify(blockchainFeedbackData), { tags });
    
    console.log(`Feedback uploaded to Irys: https://gateway.irys.xyz/${receipt.id}`);
    
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
  console.log(`Irys upload service running on port ${PORT}`);
});
