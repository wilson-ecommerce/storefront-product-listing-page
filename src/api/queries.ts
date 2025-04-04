/*
Copyright 2024 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { Facet, Product, ProductView } from './fragments';

const ATTRIBUTE_METADATA_QUERY = `
    query attributeMetadata {
        attributeMetadata {
        sortable {
            label
            attribute
            numeric
        }
        filterableInSearch {
            label
            attribute
            numeric
        }
        }
    }
`;

const QUICK_SEARCH_QUERY = `
    query quickSearch(
        $phrase: String!
        $pageSize: Int = 20
        $currentPage: Int = 1
        $filter: [SearchClauseInput!]
        $sort: [ProductSearchSortInput!]
        $context: QueryContextInput
    ) {
        productSearch(
            phrase: $phrase
            page_size: $pageSize
            current_page: $currentPage
            filter: $filter
            sort: $sort
            context: $context
        ) {
            suggestions
            items {
                ...Product
            }
            page_info {
                current_page
                page_size
                total_pages
            }
        }
    }
    ${Product}
`;

export const FranchiseQueryFragment = `
  fragment FRANCHISE_QUERY on ProductSearchItem {
    ...Product
    ...ProductView
  }
`;

const ProductSearchQueryFragment = `
    fragment PRODUCT_SEARCH on Query {
        productSearch(
            phrase: $phrase
            page_size: $pageSize
            current_page: $currentPage
            filter: $filter
            sort: $sort
            context: $context
        ) {
            total_count
            items {
                ...Product
                ...ProductView
            }
            facets {
                ...Facet
            }
            page_info {
                current_page
                page_size
                total_pages
            }
        }
        attributeMetadata {
            sortable {
                label
                attribute
                numeric
            }
        }
    }
`;

const PRODUCT_SEARCH_QUERY = `
    query productSearch(
        $phrase: String!
        $pageSize: Int
        $currentPage: Int = 1
        $filter: [SearchClauseInput!]
        $sort: [ProductSearchSortInput!]
        $context: QueryContextInput
    ) {
        ...PRODUCT_SEARCH
    }
    ${Product}
    ${ProductView}
    ${Facet}
    ${ProductSearchQueryFragment}
`;

const CATEGORY_QUERY = `
    query categoryQuery(
        $categoryId: String!
        $phrase: String!
        $pageSize: Int
        $currentPage: Int = 1
        $filter: [SearchClauseInput!]
        $sort: [ProductSearchSortInput!]
        $context: QueryContextInput
    ) {
        categories(ids: [$categoryId]) {
            name
            urlKey
            urlPath
        }
        ...PRODUCT_SEARCH
    }
    ${Product}
    ${ProductView}
    ${Facet}
    ${ProductSearchQueryFragment}
`;

const REFINE_PRODUCT_QUERY = `
    query refineProduct(
        $optionIds: [String!]!
        $sku: String!
    ) {
        refineProduct(
            optionIds: $optionIds
            sku: $sku
        ) {
            __typename
            id
            externalId
            sku
            name
            inStock
            url
            urlKey
            images {
                label
                url
                roles
            }
            ... on SimpleProductView {
                price {
                    final {
                        amount {
                            value
                        }
                    }
                    regular {
                        amount {
                            value
                        }
                    }
                }
            }
            ... on ComplexProductView {
                options {
                    id
                    title
                    required
                    values {
                        id
                        title
                        ... on ProductViewOptionValueSwatch {
                            inStock
                            type
                            value
                        }
                    }
                }
                priceRange {
                    maximum {
                        final {
                            amount {
                                value
                            }
                        }
                        regular {
                            amount {
                                value
                            }
                        }
                    }
                    minimum {
                        final {
                            amount {
                                value
                            }
                        }
                        regular {
                            amount {
                                value
                            }
                        }
                    }
                }
            }
        }
    }
`;

const GET_CUSTOMER_CART = `
    query customerCart {
        customerCart {
            id
            items {
            id
            product {
                name
                sku
            }
            quantity
            }
        }
    }
`;

const GET_PRODUCT_LABELS_QUERY = `
  query WilsonAmLabelProvider($productIds: [Int]!, $mode: AmLabelMode!) {
    wilsonAmLabelProvider(productIds: $productIds, mode: $mode) {
      items {
        label_id
        product_id
        position
        name
        txt
        image
        size
        style
        is_visible
        redirect_url
        alt_tag
        additional_data {
          place
          icon
          text_color
          background_color
        }
      }
    }
  }
`;

export {
  ATTRIBUTE_METADATA_QUERY,
  GET_CUSTOMER_CART,
  PRODUCT_SEARCH_QUERY,
  QUICK_SEARCH_QUERY,
  REFINE_PRODUCT_QUERY,
  CATEGORY_QUERY,
  GET_PRODUCT_LABELS_QUERY
};
