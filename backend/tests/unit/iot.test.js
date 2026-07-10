describe('IoT Service Data Processing Unit Tests', () => {

    const calculateAggregates = (readings) => {
        if (readings.length === 0) return 0;
        const sum = readings.reduce((a, b) => a + b, 0);
        return sum / readings.length;
    };

    const getAlertStatus = (moisture) => {
        if (moisture < 30) return 'Drought Alert';
        if (moisture > 90) return 'Flood Alert';
        return 'Normal';
    };

    const celsiusToFahrenheit = (c) => (c * 9/5) + 32;

    const isDataStale = (timestampStr) => {
        const timestamp = new Date(timestampStr).getTime();
        const now = new Date().getTime();
        return (now - timestamp) > 3600000; // 1 hour in ms
    };

    // 13. Aggregate calculation
    it('Should calculate soil moisture aggregates correctly', () => {
        const readings = [40, 50, 60];
        expect(calculateAggregates(readings)).toBe(50);
    });

    // 14. Drought alert
    it('Should trigger drought alert logic if moisture < 30%', () => {
        expect(getAlertStatus(25)).toBe('Drought Alert');
    });

    // 15. Flood alert
    it('Should trigger flood alert logic if moisture > 90%', () => {
        expect(getAlertStatus(95)).toBe('Flood Alert');
    });

    // 16. Temp conversion
    it('Should correctly convert temperature units (C to F)', () => {
        expect(celsiusToFahrenheit(0)).toBe(32);
        expect(celsiusToFahrenheit(100)).toBe(212);
        expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    // 17. Stale data
    it('Should flag stale IoT sensor data (timestamp > 1hr)', () => {
        const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
        const tenMinutesAgo = new Date(Date.now() - 600000).toISOString();
        
        expect(isDataStale(twoHoursAgo)).toBe(true);
        expect(isDataStale(tenMinutesAgo)).toBe(false);
    });
});
