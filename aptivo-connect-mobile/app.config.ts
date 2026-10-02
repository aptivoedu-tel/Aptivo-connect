import baseConfig from './app.json';

export default () => ({
  ...baseConfig.expo,
  extra: {
    eas: { projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID },
  },
});
