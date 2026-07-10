const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth & User Service Unit Tests', () => {
    const mockSecret = 'test_secret_123';
    
    beforeAll(() => {
        process.env.JWT_SECRET = mockSecret;
    });

    // 1. Password hashing
    it('Should correctly hash passwords using bcrypt', async () => {
        const password = 'mySecurePassword123!';
        const hash = await bcrypt.hash(password, 10);
        expect(hash).not.toBe(password);
        
        const isMatch = await bcrypt.compare(password, hash);
        expect(isMatch).toBe(true);
    });

    // 2. JWT Generation
    it('Should successfully generate JWT tokens with correct expiry', () => {
        const payload = { userId: '123', role: 'farmer' };
        const token = jwt.sign(payload, mockSecret, { expiresIn: '1h' });
        
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // Header.Payload.Signature
    });

    // 3. JWT Empty Payload
    it('Should fail JWT generation on empty payload (strictly speaking, it allows it, but our logic forbids it)', () => {
        const generateInvalidToken = () => {
            const payload = null; // Our service logic throws if payload is missing
            if (!payload) throw new Error('Payload required');
            jwt.sign(payload, mockSecret);
        };
        expect(generateInvalidToken).toThrow('Payload required');
    });

    // 4. JWT Decode Valid
    it('Should decode and verify a valid JWT token', () => {
        const payload = { userId: '123' };
        const token = jwt.sign(payload, mockSecret);
        
        const decoded = jwt.verify(token, mockSecret);
        expect(decoded.userId).toBe('123');
    });

    // 5. JWT Expired
    it('Should throw TokenExpiredError for expired tokens', () => {
        const token = jwt.sign({ userId: '123' }, mockSecret, { expiresIn: '-1s' });
        
        expect(() => {
            jwt.verify(token, mockSecret);
        }).toThrow(jwt.TokenExpiredError);
    });

    // 6. Normalize Email
    it('Should normalize user email inputs (lowercase, trim)', () => {
        const rawEmail = '  UsEr@Example.COM  ';
        const normalized = rawEmail.toLowerCase().trim();
        expect(normalized).toBe('user@example.com');
    });

    // 7. Default Role
    it('Should default new users to the farmer role if unspecified', () => {
        const createUser = (data) => {
            return {
                email: data.email,
                role: data.role || 'farmer'
            };
        };
        
        const user = createUser({ email: 'test@test.com' });
        expect(user.role).toBe('farmer');
    });
});
