import { Fragment, FunctionComponent, useEffect } from "react";
import { ContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client";
import { waitForElm } from "../../utils/ch-utils";

interface HideSearchFiltersProps {
  searchIdentifier: string;
  filters: {
    [key: string]: string[];
  };
  getEventSearchIdentifier: (searchIdentifier: string) => string;
  client: ContentHubClient;
  groups: string[];
}

const HideSearchFilters: FunctionComponent<HideSearchFiltersProps> = ({
  searchIdentifier,
  getEventSearchIdentifier,
  filters,
  groups,
}) => {
  const hideElements = (elementsToHide: string[]) => {
    let filtersPanel: any[] | undefined = undefined;
    elementsToHide.forEach((name) => {
      let querySelector = `div[data-testid="search-component-${searchIdentifier}"] h5[class*='-facetTile'][title='${name}']`;
      waitForElm(querySelector).then((elem) => {
        if (elem?.parentElement?.parentElement) {
          elem.parentElement.parentElement.hidden = true;
          if (!filtersPanel) {
            filtersPanel = Array.prototype.slice.call(
              elem.parentElement.parentElement.parentElement?.children
            );
          }
          let index = filtersPanel.indexOf(elem.parentElement.parentElement);
          if (index < filtersPanel.length && filtersPanel[index + 1]) {
            filtersPanel[index + 1].hidden = true;
          }
        }
      });
    });
  };

  const hideFilters = (department: string) => {
    let elementsToHide = filters[department] || filters["all"];
    if (elementsToHide && elementsToHide.length > 0) {
      hideElements(elementsToHide);
    } else {
      hideElements(filters["default"]);
    }
};


useEffect(() => {
  const removeFiltersOnSearchEvent = (evt: Event): void => {
    const { searchIdentifier: eventSearchIdentifier } = (
      evt as CustomEvent<{
        searchIdentifier: string;
      }>
    ).detail;

    if (
      eventSearchIdentifier === getEventSearchIdentifier(searchIdentifier)
    ) {
      if (groups && groups.length > 0) {
        groups.forEach((group) => {
          if (group) {
            hideFilters(group);
          }
        });
      } else {
        hideFilters('all');
      }

      window.removeEventListener("SEARCH_FINISHED", removeFiltersOnSearchEvent, true);
    }
  };

  window.addEventListener("SEARCH_FINISHED", removeFiltersOnSearchEvent, true);
}, []);

  return <Fragment></Fragment>;
};

export default HideSearchFilters;