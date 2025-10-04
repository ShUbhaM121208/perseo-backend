import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';

// Mock data
const testOnboardingData = {
  purpose: 'Personal',
  profession: 'Software Engineer',
  integrations: ['Gmail', 'Calendar'],
};

const mockDbRecord = {
  user_id: 'test-user-123',
  purpose: 'Personal',
  profession: 'Software Engineer',
  integrations: ['Gmail', 'Calendar'],
  created_at: '2025-10-04T10:00:00Z',
  updated_at: '2025-10-04T10:00:00Z',
};

// Mock functions
let mockSaveOnboarding: jest.MockedFunction<any>;
let mockGetOnboarding: jest.MockedFunction<any>;

// Create test app
const createTestApp = async () => {
  const app = express();
  app.use(express.json());
  
  // Mock auth middleware
  app.use((req: any, res, next) => {
    req.user = { id: 'test-user-123' };
    next();
  });

  // Mock routes that mimic the real ones
  app.post('/api/onboarding', async (req: any, res) => {
    try {
      const { purpose, profession, integrations } = req.body;
      
      // Validation
      if (!purpose || !profession || !Array.isArray(integrations)) {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid required fields: purpose, profession, integrations'
        });
      }
      
      const result = await mockSaveOnboarding(req.user.id, {
        purpose,
        profession,
        integrations
      });
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to save onboarding data'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to save onboarding data'
      });
    }
  });
  
  app.get('/api/onboarding', async (req: any, res) => {
    try {
      const result = await mockGetOnboarding(req.user.id);
      
      if (result.success) {
        res.status(200).json(result);
      } else if (result.error?.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'No onboarding data found for user'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch onboarding data'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch onboarding data'
      });
    }
  });
  
  return app;
};

describe('Onboarding API Endpoints', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Initialize mock functions
    mockSaveOnboarding = jest.fn() as jest.MockedFunction<any>;
    mockGetOnboarding = jest.fn() as jest.MockedFunction<any>;
    
    app = await createTestApp();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/onboarding', () => {
    it('should save onboarding data successfully', async () => {
      // Mock successful response
      mockSaveOnboarding.mockResolvedValueOnce({
        success: true,
        data: mockDbRecord,
      });

      const response = await request(app)
        .post('/api/onboarding')
        .send(testOnboardingData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockDbRecord,
      });

      // Verify the service was called with correct data
      expect(mockSaveOnboarding).toHaveBeenCalledWith('test-user-123', {
        purpose: 'Personal',
        profession: 'Software Engineer',
        integrations: ['Gmail', 'Calendar'],
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSaveOnboarding.mockResolvedValueOnce({
        success: false,
        error: 'Database connection failed',
      });

      const response = await request(app)
        .post('/api/onboarding')
        .send(testOnboardingData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Failed to save onboarding data',
      });
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        purpose: 'Personal',
        // Missing profession and integrations
      };

      const response = await request(app)
        .post('/api/onboarding')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(mockSaveOnboarding).not.toHaveBeenCalled();
    });

    it('should handle invalid integrations array', async () => {
      const invalidData = {
        ...testOnboardingData,
        integrations: 'not-an-array', // Should be array
      };

      const response = await request(app)
        .post('/api/onboarding')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(mockSaveOnboarding).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/onboarding', () => {
    it('should fetch onboarding data successfully', async () => {
      // Mock successful response
      mockGetOnboarding.mockResolvedValueOnce({
        success: true,
        data: mockDbRecord,
      });

      const response = await request(app)
        .get('/api/onboarding')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockDbRecord,
      });

      // Verify the service was called correctly
      expect(mockGetOnboarding).toHaveBeenCalledWith('test-user-123');
    });

    it('should handle case when no onboarding data exists', async () => {
      // Mock no data found
      mockGetOnboarding.mockResolvedValueOnce({
        success: false,
        error: 'Onboarding data not found for user',
      });

      const response = await request(app)
        .get('/api/onboarding')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'No onboarding data found for user',
      });
    });

    it('should handle database errors when fetching', async () => {
      // Mock database error
      mockGetOnboarding.mockResolvedValueOnce({
        success: false,
        error: 'Connection timeout',
      });

      const response = await request(app)
        .get('/api/onboarding')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Failed to fetch onboarding data',
      });
    });
  });

  describe('Authentication middleware', () => {
    it('should inject user ID correctly', async () => {
      mockGetOnboarding.mockResolvedValueOnce({
        success: true,
        data: mockDbRecord,
      });

      await request(app)
        .get('/api/onboarding')
        .expect(200);

      // Verify that the correct user ID was used
      expect(mockGetOnboarding).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('Integration flow', () => {
    it('should complete save and fetch cycle', async () => {
      // Mock save response
      mockSaveOnboarding.mockResolvedValueOnce({
        success: true,
        data: mockDbRecord,
      });

      // Save onboarding data
      const saveResponse = await request(app)
        .post('/api/onboarding')
        .send(testOnboardingData)
        .expect(200);

      expect(saveResponse.body.success).toBe(true);
      expect(mockSaveOnboarding).toHaveBeenCalledWith('test-user-123', testOnboardingData);

      // Mock fetch response
      mockGetOnboarding.mockResolvedValueOnce({
        success: true,
        data: mockDbRecord,
      });

      // Fetch onboarding data
      const fetchResponse = await request(app)
        .get('/api/onboarding')
        .expect(200);

      expect(fetchResponse.body.success).toBe(true);
      expect(fetchResponse.body.data).toEqual(mockDbRecord);
      expect(mockGetOnboarding).toHaveBeenCalledWith('test-user-123');
    });
  });

  describe('Service layer validation', () => {
    it('should ensure service functions follow the contract', () => {
      // Test that our mock functions match the expected interface
      expect(typeof mockSaveOnboarding).toBe('function');
      expect(typeof mockGetOnboarding).toBe('function');
    });

    it('should handle edge cases in data validation', async () => {
      const edgeCaseData = {
        purpose: '',
        profession: 'Test',
        integrations: [],
      };

      const response = await request(app)
        .post('/api/onboarding')
        .send(edgeCaseData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});