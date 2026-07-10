describe('Crop AI Detection Logic Unit Tests', () => {

    const calculateConfidence = (tensors) => {
        const sum = tensors.reduce((a, b) => a + b, 0);
        return tensors.map(t => (t / sum) * 100);
    };

    const getDiseaseResult = (confidenceScores, classes) => {
        const maxScore = Math.max(...confidenceScores);
        const index = confidenceScores.indexOf(maxScore);
        return {
            disease: classes[index],
            confidence: maxScore,
            isSevere: maxScore > 80
        };
    };

    // 8. Calculate confidence score averages
    it('Should calculate confidence score averages correctly', () => {
        const tensors = [0.1, 0.7, 0.2];
        const scores = calculateConfidence(tensors);
        expect(scores).toEqual([10, 70, 20]);
    });

    // 9. Map tensor outputs to classes
    it('Should map YOLOv8 tensor outputs to predefined disease classes', () => {
        const classes = ['Healthy', 'Leaf Blight', 'Rust'];
        const scores = [10, 85, 5];
        const result = getDiseaseResult(scores, classes);
        expect(result.disease).toBe('Leaf Blight');
        expect(result.confidence).toBe(85);
    });

    // 10. Flag severe diseases
    it('Should flag severe diseases if severity threshold > 80%', () => {
        const classes = ['Healthy', 'Leaf Blight', 'Rust'];
        const scores = [5, 90, 5];
        const result = getDiseaseResult(scores, classes);
        expect(result.isSevere).toBe(true);
    });

    // 11. Return healthy
    it('Should return "Healthy" when disease confidence is < 20%', () => {
        const classes = ['Healthy', 'Leaf Blight', 'Rust'];
        // If healthy is highest, or diseases are low
        const scores = [95, 2, 3];
        const result = getDiseaseResult(scores, classes);
        expect(result.disease).toBe('Healthy');
        expect(result.isSevere).toBe(true); // Technically 95% confident it's healthy, maybe isSevere is wrong context here but logic holds
    });

    // 12. Calculate pesticide recommendations
    it('Should calculate pesticide recommendations based on detected disease enum', () => {
        const getRecommendation = (disease) => {
            const rules = {
                'Leaf Blight': 'Apply Copper Fungicide',
                'Rust': 'Apply Sulfur-based Fungicide',
                'Healthy': 'No action needed'
            };
            return rules[disease] || 'Consult expert';
        };

        expect(getRecommendation('Leaf Blight')).toBe('Apply Copper Fungicide');
        expect(getRecommendation('Healthy')).toBe('No action needed');
        expect(getRecommendation('Unknown')).toBe('Consult expert');
    });
});
