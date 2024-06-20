import { gql } from '@apollo/client';

export const FmSettingsFragment = gql`
  fragment FmSettingsFragment on Settings {
    fmSettings {
      consultationImage {
        node {
          altText
          mediaItemUrl
          mediaDetails {
            width
            height
          }
        }
      }
      consultationHeadingText
      consultationLink {
        target
        title
        url
      }
      mailchimpFormActionUrl
      contactInfo {
        address {
          addressLine1
          addressLine2
        }
        contactDetails {
          email
          phone
        }
      }
    }
  }
`;
