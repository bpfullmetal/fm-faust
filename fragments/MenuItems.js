import { gql } from '@apollo/client';

export const NavigationMenuItemFragment = gql`
  fragment NavigationMenuItemFragment on MenuItem {
    label
    path
  }
`;
