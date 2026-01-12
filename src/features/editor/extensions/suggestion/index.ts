import {
  acceptSuggestionKeymap,
  createSuggestionDebouncePlugin,
  renderSuggestionPlugin,
  suggestionState,
} from "./helpers";

export const suggestion = (fileName: string) => [
  suggestionState,
  createSuggestionDebouncePlugin(fileName),
  renderSuggestionPlugin,
  acceptSuggestionKeymap,
];
