import { gql } from '@apollo/client';

export const NavigationMainMenuItemFragment = gql`
  fragment NavigationMainMenuItemFragment on MenuItem {
    label
    path
  }
`;
