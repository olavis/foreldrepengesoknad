const config = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', 'storybook-react-intl'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
};

export default config;
