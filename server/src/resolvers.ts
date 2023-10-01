import { Resolvers } from "./types";
import { GraphQLFormattedError } from "graphql";

export const resolvers: Resolvers = {
  Query: {
    // returns an array of Tracks that will be used to populate the homepage grid of our web client
    tracksForHome: (_, __, { dataSources }) => {
      return dataSources.trackAPI.getTracksForHome();
    },

    // get a single track by ID, for the track page
    track: (_, { id }, { dataSources }) => {
      return dataSources.trackAPI.getTrack(id);
    },

    // get a single module by ID, for the module detail page
    module: (_, { id }, { dataSources }) => {
      return dataSources.trackAPI.getModule(id);
    },
  },
  Mutation: {
    incrementTrackViews: async (_, { id }, { dataSources }) => {
      return dataSources.trackAPI
        .incrementTrackViews(id)
        .then((track) =>
          successWithData(incrementTrackViewsSuccessMessage(track.id), {
            track,
          })
        )
        .catch((err) => errorWithData(err, { track: null }));
    },
  },
  Track: {
    author: ({ authorId }, _, { dataSources }) => {
      return dataSources.trackAPI.getAuthor(authorId);
    },

    modules: ({ id }, _, { dataSources }) => {
      return dataSources.trackAPI.getTrackModules(id);
    },
  },
};

/// probably shouldnt really extend GraphQLFormattedError
/// error?.extensions.response is a bit of an apollo mystery in resolvers at this point
interface CustomErrorType extends GraphQLFormattedError {
  extensions: {
    response: {
      status: number;
      body: string;
    };
  };
}
interface BaseResponse {
  code: number;
  success: boolean;
  message: string;
}

type Response<T> = BaseResponse & {
  [K in keyof T]: T[K];
};

// Modify the successWithData function
const successWithData = <T>(message: string, data: T): Response<T> => ({
  code: 200,
  success: true,
  message: message,
  ...data,
});

const errorWithData = <T>(
  error: CustomErrorType | undefined,
  data: T
): Response<T> => {
  const response: Response<T> = {
    code: error?.extensions.response?.status || 500,
    success: false,
    message: error?.extensions.response?.body || "Unknown error",
    ...data,
  };

  return response;
};

const incrementTrackViewsSuccessMessage = (id: string) =>
  `Successfully incremented number of views for track ${id}`;

// interface CustomErrorType extends GraphQLFormattedError {
//   extensions: {
//     response: {
//       status: number;
//       body: string;
//     };
//   };
// }

// interface MyResponse<T> {
//   code: number;
//   success: boolean;
//   message: string;
//   data: T;
// }

// const successWithData = <T>(message: string, data: T): MyResponse<T> => ({
//   code: 200,
//   success: true,
//   message: message,
//   data: data,
// });

// const errorWithData = <T>(
//   error: CustomErrorType | undefined,
//   data: T
// ): MyResponse<T> => {
//   if (error) {
//     return {
//       code: error.extensions.response?.status || 500,
//       success: false,
//       message: error.extensions.response?.body || "Unknown error",
//       data: data,
//     };
//   }
//   // Handle other cases, if needed
//   return {
//     code: 500,
//     success: false,
//     message: "Unknown error",
//     data: data,
//   };
// };

// const incrementTrackViewsSuccessMessage = (id: string) =>
//   `Successfully incremented number of views for track ${id}`;

// const successWithData = <T>(message: string, data: T) => ({
//   code: 200,
//   success: true,
//   message: message,
//   ...data,
// });

// interface CustomErrorType extends GraphQLFormattedError {
//   extensions: {
//     response: {
//       status: number;
//       body: string;
//     };
//   };
// }
// const errorWithData = <T>(error: CustomErrorType, data: T) => ({
//   code: error.extensions.response.status,
//   success: true,
//   message: error.extensions.response.body,
//   ...data,
// });
