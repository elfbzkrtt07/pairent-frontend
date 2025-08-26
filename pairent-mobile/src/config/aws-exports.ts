// src/config/aws-exports.ts
import type { ResourcesConfig } from "aws-amplify";

const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      // NOTE: no `region` field in v6 here
      userPoolId: "eu-north-1_LRB1Cr2sA",
      userPoolClientId: "c2377oft10p8nb7isiemn2hg2", // was userPoolWebClientId
      identityPoolId: "eu-north-1:98753057-19f3-47f8-b5d5-e78f7fde5a03",
      // authenticationFlowType defaults to USER_SRP_AUTH in v6
    },
  },
};

export default awsConfig;
