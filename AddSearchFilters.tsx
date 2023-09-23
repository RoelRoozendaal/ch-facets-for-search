import { FieldFilterRequestResource } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/field-filter-request-resource";
import { FieldFilterResponseResource } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/field-filter-response-resource";
import { FilterDictionary } from "./FilterDictionary";
import { Fragment, FunctionComponent, useEffect } from "react";
import { ContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client";
import { FilterConfig } from "./FilterConfig";

interface AddSearchFiltersProps {
  searchIdentifier: string;
  filters: {
    [key: string]: FilterConfig[];
  };
  addFilters: (
    searchIdentifier: string,
    filters: Array<FieldFilterRequestResource>
  ) => void;

  getEventSearchIdentifier: (searchIdentifier: string) => string;
  client: ContentHubClient;
  groups: string[];
}

const AddSearchFilters: FunctionComponent<AddSearchFiltersProps> = ({
  searchIdentifier,
  addFilters,
  getEventSearchIdentifier,
  filters,
  client,
  groups,
}) => {
  const filterDictionary = new FilterDictionary<number, number>();

  const convertFitersToDictionary = async (department: string) => {
    const groupFilters = filters[department];
    if (!groupFilters) return;

    // Start all getIdAsync calls in parallel and wait for them to complete
    const keys = await Promise.all(
        groupFilters.map(filter => client.entityDefinitions.getIdAsync(filter.filterName))
    );

    // Flatten the nested asynchronous operations
    const filterEntityPromises = [];
    for (let i = 0; i < groupFilters.length; i++) {
        const filter = groupFilters[i];
        const key = keys[i];
        if (!key) continue;

        for (const value of filter.values) {
            filterEntityPromises.push(
                client.entities.getAsync(value).then(filterEntity => {
                    if (filterEntity?.id) {
                        filterDictionary.insertValueByKey(key, filterEntity.id);
                    }
                })
            );
        }
    }

    // Wait for all getAsync calls to complete
    await Promise.all(filterEntityPromises);
  };

  const addSearchFilter = () => {
    const extraFilters = filterDictionary.toFilterRequest();

    addFilters(searchIdentifier, extraFilters);
  };

  useEffect(() => {
    if (!groups.some(group => group.startsWith('DEP'))) {
      return;
    }

    groups.forEach((group) => {
      if (group) {
        convertFitersToDictionary(group);
      }
    });

    const addSearchFiltersOnSearchEvent = (evt: Event): void => {
      const { searchIdentifier: eventSearchIdentifier } = (
        evt as CustomEvent<{
          searchIdentifier: string;
          fullText: string;
          filters: Array<FieldFilterResponseResource>;
          ids: Array<number>;
        }>
      ).detail;

      if (
        eventSearchIdentifier === getEventSearchIdentifier(searchIdentifier)
      ) {
        addSearchFilter();
        window.removeEventListener(
          "SEARCH_FINISHED",
          addSearchFiltersOnSearchEvent
        );
      }
    };

    window.addEventListener("SEARCH_FINISHED", addSearchFiltersOnSearchEvent);
  }, []);

  return (<Fragment></Fragment>);
};

export default AddSearchFilters;