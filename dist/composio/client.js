import { Composio } from "@composio/core";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
});
export default composio;
//# sourceMappingURL=client.js.map