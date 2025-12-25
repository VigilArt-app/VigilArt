import { Artwork, WebsiteCategory } from "@vigilart/shared";
import {
  ArtworksReportEntry,
  AggregatedVisualSearchResults,
} from "@vigilart/shared";
import { DEFAULT_PAGINATION_LIMIT } from "@vigilart/shared";

export const mockedSearchImageReturnValue = {
  metadata: null,
  matchingPages: [
    {
      url: "https://in.pinterest.com/rukminidubey/illustration-light-tone/",
      pageTitle: "Discover 21 Illustration Light tone and cute drawings ideas",
      category: WebsiteCategory.SOCIAL,
      websiteName: "pinterest.com",
      imageUrl:
        "https://i.pinimg.com/236x/b0/42/f7/b042f7f4d3583298407291b0a8882fef.jpg",
    },
    {
      url: "https://emblask.tumblr.com/post/650058868223819776",
      pageTitle: "Ayaka Suda illustration - Tumblr",
      category: WebsiteCategory.SOCIAL,
      websiteName: "tumblr.com",
      imageUrl:
        "https://64.media.tumblr.com/853eb47c8fe24d2dbb2f742e906b9378/2bfc4b18c0150b65-5d/s640x960/6e3b30d3cd28d4eda06032af3f6b503b0450ba66.jpg",
    },
    {
      url: "ebay.com/art_shop",
      pageTitle: "Ebay art sold",
      category: WebsiteCategory.MARKETPLACES,
      websiteName: "ebay.com",
      imageUrl: "imageUri",
    },
    {
      url: "artstation.com/artist",
      pageTitle: "Ebay art sold",
      category: WebsiteCategory.ART_PLATFORMS,
      websiteName: "artstation.com",
      imageUrl: "imageUri",
    },
  ],
};

export const mockedArtwork: Artwork = {
  id: "1",
  userId: "0",
  imageUri: "imageUri",
  createdAt: new Date(),
  updatedAt: new Date(),
  originalFilename: null,
  contentType: null,
  sizeBytes: null,
  description: null,
  lastScanAt: null,
};

export const mockedAggregatedResults: AggregatedVisualSearchResults = {
  statistics: {
    totalMatches: mockedSearchImageReturnValue.matchingPages.length,
  },
  matchingPages: mockedSearchImageReturnValue.matchingPages,
};

export const mockedArtworks: Artwork[] = [
  mockedArtwork,
  {
    ...mockedArtwork,
    id: "2",
  },
  {
    ...mockedArtwork,
    id: "3",
  },
  {
    ...mockedArtwork,
    id: "4",
  },
];

export const mockedFilteredArtworksReportEntries: ArtworksReportEntry[] = [
  {
    artworkId: "1",
    statistics: {
      totalMatches: mockedSearchImageReturnValue.matchingPages.length,
    },
    matchingPages: mockedSearchImageReturnValue.matchingPages.slice(
      0,
      DEFAULT_PAGINATION_LIMIT
    ),
  },
  {
    artworkId: "2",
    statistics: {
      totalMatches: mockedSearchImageReturnValue.matchingPages.length,
    },
    matchingPages: mockedSearchImageReturnValue.matchingPages.slice(
      0,
      DEFAULT_PAGINATION_LIMIT
    ),
  },
  {
    artworkId: "3",
    statistics: {
      totalMatches: mockedSearchImageReturnValue.matchingPages.length,
    },
    matchingPages: mockedSearchImageReturnValue.matchingPages.slice(
      0,
      DEFAULT_PAGINATION_LIMIT
    ),
  },
];

export const mockedArtworksReportEntries: ArtworksReportEntry[] = [
  {
    artworkId: "1",
    statistics: {
      totalMatches: mockedSearchImageReturnValue.matchingPages.length,
    },
    matchingPages: mockedSearchImageReturnValue.matchingPages,
  },
  {
    artworkId: "2",
    statistics: {
      totalMatches: mockedSearchImageReturnValue.matchingPages.length,
    },
    matchingPages: mockedSearchImageReturnValue.matchingPages,
  },
  {
    artworkId: "3",
    statistics: {
      totalMatches: mockedSearchImageReturnValue.matchingPages.length,
    },
    matchingPages: mockedSearchImageReturnValue.matchingPages,
  },
];
