module.exports = {
    ci: {
        collect: {
            url: ['http://localhost:9090/#covid19/'],
            startServerCommand: 'npm run start:examples',
            numberOfRuns: 5,
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
};
