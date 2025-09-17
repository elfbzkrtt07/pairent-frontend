// src/config/aws-exports.ts
import type { ResourcesConfig } from "aws-amplify";

const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: "eu-north-1_LRB1Cr2sA",
      userPoolClientId: "c2377oft10p8nb7isiemn2hg2", 
    },
  },
};

export default awsConfig;
