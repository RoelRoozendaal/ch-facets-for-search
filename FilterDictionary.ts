import { FieldFilterRequestResource } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/field-filter-request-resource";
import { FilterOperator } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/filter-operator";
import { RequestedFilterType } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/requested-filter-type";

export class FilterDictionary<TKey extends string | number, TValue>{
    private dictionary: Record<TKey, TValue[]> = {} as Record<TKey, TValue[]>;

    public insertValueByKey(key: TKey, value: TValue) : void{
        if(this.dictionary.hasOwnProperty(key)){
            this.dictionary[key].push(value);
        } else {
            this.dictionary[key] = [value]
        }
    }
    
    public toArray(): Array<[TKey, TValue[]]>{
        return Object.entries(this.dictionary) as Array<[TKey, TValue[]]>
    }

    public toFilterRequest() : Array<FieldFilterRequestResource>{
        return this.toArray().map(([key, value]) => {
            return new FieldFilterRequestResource({
              fieldName: `taxonomy_items.${key}.*`,
              values: value,
              nestedValues: [],
              operator: FilterOperator.AnyOf,
              visible: true,
              hidden: true,
              multiSelect: true,
              filterType: RequestedFilterType.InFilter,
            });
          });
    }
}