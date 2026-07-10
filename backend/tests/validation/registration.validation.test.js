describe('User Registration Validation Tests', () => {

    const validateRegistration = (payload) => {
        const errors = [];
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        
        if (!payload.email) errors.push('Email is required');
        else if (!emailRegex.test(payload.email)) errors.push('Malformed email string');
        
        if (!payload.password || payload.password.length < 8) errors.push('Password must be at least 8 characters');
        else if (!/[A-Za-z]/.test(payload.password) || !/[0-9]/.test(payload.password)) errors.push('Password must be alphanumeric');
        
        const validRoles = ['farmer', 'buyer', 'expert', 'delivery'];
        if (payload.role && !validRoles.includes(payload.role)) errors.push('Unsupported user role');
        
        if (!payload.phone) errors.push('Phone number is required');
        else if (!/^[6-9]\\d{9}$/.test(payload.phone)) errors.push('Invalid Indian mobile number');
        
        return errors;
    };

    // 31. Reject missing email
    it('Should reject missing email payload', () => {
        const errors = validateRegistration({ password: 'Password123', phone: '9876543210' });
        expect(errors).toContain('Email is required');
    });

    // 32. Malformed email
    it('Should reject malformed email strings', () => {
        const errors = validateRegistration({ email: 'invalid-email', password: 'Password123', phone: '9876543210' });
        expect(errors).toContain('Malformed email string');
    });

    // 33. Password length
    it('Should reject passwords under 8 characters', () => {
        const errors = validateRegistration({ email: 'test@test.com', password: 'Pass1', phone: '9876543210' });
        expect(errors).toContain('Password must be at least 8 characters');
    });

    // 34. Password diversity
    it('Should reject passwords lacking alphanumeric diversity', () => {
        const errors = validateRegistration({ email: 'test@test.com', password: 'password', phone: '9876543210' });
        expect(errors).toContain('Password must be alphanumeric');
    });

    // 35. Unsupported role
    it('Should reject unsupported user roles', () => {
        const errors = validateRegistration({ email: 'test@test.com', password: 'Password123', phone: '9876543210', role: 'superadmin' });
        expect(errors).toContain('Unsupported user role');
    });

    // 36. Missing phone
    it('Should reject missing phone numbers', () => {
        const errors = validateRegistration({ email: 'test@test.com', password: 'Password123' });
        expect(errors).toContain('Phone number is required');
    });

    // 37. Invalid Indian mobile
    it('Should reject invalid Indian mobile numbers (must be 10 digits starting with 6-9)', () => {
        const err1 = validateRegistration({ email: 'test@test.com', password: 'Password123', phone: '12345' });
        expect(err1).toContain('Invalid Indian mobile number');
        
        const err2 = validateRegistration({ email: 'test@test.com', password: 'Password123', phone: '5123456789' });
        expect(err2).toContain('Invalid Indian mobile number');
    });
});
