import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { TrackAPI } from "./datasources/track-api";

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      // Customize error formatting here
      return {
        message: error.message,
        code: error.extensions.code || "UNKNOWN_ERROR",
        // Add more custom fields if needed
      };
    },
  });
  const { url } = await startStandaloneServer(server, {
    context: async () => {
      const { cache } = server;
      return {
        dataSources: {
          trackAPI: new TrackAPI({ cache }),
        },
      };
    },
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
