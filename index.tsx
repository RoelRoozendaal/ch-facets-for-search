import { createRoot } from "react-dom/client";
import { FieldFilterRequestResource } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/field-filter-request-resource";
import AddSearchFilters from "./AddSearchFilters";
import { ContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client";
import { Fragment } from "react";
import HideSearchFilters from "./HideSearchFilters";

interface FilterConfig {
  filterName: string;
  values: string[];
}

interface Context {
  user: {
    userGroups: string[];
  };
  config: {
    hideFilters: {
      [key: string]: string[];
    };
    applyFilters: {
      [key: string]: FilterConfig[];
    };
    searchIdentifier: string;
  };
  api: {
    search: {
      addFilters: (
        searchIdentifier: string,
        filters: Array<FieldFilterRequestResource>
      ) => void;
      getEventSearchIdentifier: (searchIdentifier: string) => string;
    };
  };
  client: ContentHubClient;
}

export default function createExternalRoot(container: HTMLElement) {
  let root = createRoot(container);
  const depPattern = /^RVR\.\w+\.RVR\d+$/;
  
  return {
    render(context: Context) {
      const { addFilters, getEventSearchIdentifier } = context.api.search;
      const { searchIdentifier, hideFilters, applyFilters } = context.config;

      let departments = context.user.userGroups
        .filter((group) => depPattern.test(group))
        .map((group) => group.split(".").pop())
        .filter((value, index, array) => array.indexOf(value) === index) // select only unique
        .filter((dep) => dep != undefined) as string[];

      root.render(
        <Fragment>
          <HideSearchFilters
            searchIdentifier={searchIdentifier}
            getEventSearchIdentifier={getEventSearchIdentifier}
            filters={hideFilters}
            client={context.client}
            groups={departments}
          />
          {
            departments.length > 0 && (
              <AddSearchFilters
                searchIdentifier={searchIdentifier}
                addFilters={addFilters}
                getEventSearchIdentifier={getEventSearchIdentifier}
                filters={applyFilters}
                client={context.client}
                groups={departments}
              />
            )
          }
        </Fragment>
      );
    },

    unmount() {
      root.unmount();
    },
  };
}