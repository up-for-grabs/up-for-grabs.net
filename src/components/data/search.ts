import { isBefore } from 'date-fns';

import { parseProject, type WebsiteProject } from './schema';

// we are adding some default fields to search results,
// so we can type them a bit better

export type CollectionSearchResult = WebsiteProject;

export interface InitMessage {
  type: 'init';
  base_uri: string;
}

export interface SearchQueryMessage {
  type: 'search';
  query: string;
}

export type WorkerMessage = InitMessage | SearchQueryMessage;

export interface ErrorMessage {
  type: 'search-error';
  message?: string;
}

export interface SearchResultsMessage {
  type: 'search-results';
  list: Readonly<CollectionSearchResult[]>;
}

export type ResponseMessage = ErrorMessage | SearchResultsMessage;

let loaded = false;
let allProjects: ReadonlyArray<WebsiteProject>;

/**
 * split init into a separate method so we can call it directly
 */
export const Init = async (lastUpdated: Date) => {
  if (!loaded) {
    const dataUrl = `${import.meta.env.BASE_URL}/data.json`;
    const response = await fetch(dataUrl);
    if (response.ok) {
      const rawProjects = await response.json();
      if (Array.isArray(rawProjects)) {
        allProjects = rawProjects.map(parseProject);
        loaded = true;

        return allProjects.filter((project) => {
          if (
            project.stats.lastUpdated &&
            isBefore(project.stats.lastUpdated, lastUpdated)
          ) {
            return false;
          }

          return true;
        });
      }
    }
    return new Error('oops');
  }
};

export const SearchProjects = async (
  text: string,
  lastUpdated: Date
): Promise<ResponseMessage> => {
  if (!loaded) {
    await Init(lastUpdated);
  }

  if (!loaded) {
    const response: ErrorMessage = {
      type: 'search-error',
      message: 'failed to load results',
    };
    return response;
  }

  const searchText = text.toLowerCase();

  const list = allProjects
    .filter((project) => {
      if (
        project.stats.lastUpdated &&
        isBefore(project.stats.lastUpdated, lastUpdated)
      ) {
        return false;
      }

      if (project.name.toLowerCase().indexOf(searchText) > -1) {
        return true;
      }

      if (project.desc.toLowerCase().indexOf(searchText) > -1) {
        return true;
      }

      return false;
    })
    .sort((left, right) => {
      return left.name.localeCompare(right.name);
    });

  const response: SearchResultsMessage = {
    type: 'search-results',
    list,
  };

  return response;
};
