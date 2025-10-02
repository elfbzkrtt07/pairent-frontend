// src/aws/bedrock.ts
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const identityPoolId = "eu-north-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

const REGION = "us-east-1"; 
const agentId = "MDX1YASPJE";
const agentAliasId = "GEYSFL3PRM";

const client = new BedrockAgentRuntimeClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    identityPoolId,
    clientConfig: { region: REGION },
  }),
});

// Ask BiBi
export async function askBibi(message: string): Promise<string> {
  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId: "session-001",
    inputText: message,
  });

  const response = await client.send(command);

  let full = "";
  if (response.completion) {
    for await (const event of response.completion) {
      if (event.chunk?.bytes) {
        full += new TextDecoder("utf-8").decode(event.chunk.bytes);
      }
    }
  }

  return full.trim();
}
