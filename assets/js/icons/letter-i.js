import * as React from 'react';

const LetterI = ({ fill = 'white' }) => {
  return (
    <svg
      width="73"
      height="113"
      viewBox="0 0 73 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="Vector"
        d="M0.086792 16.2815H25.3142C26.4982 16.2815 27.4531 17.2388 27.4531 18.4258V94.338C27.4531 95.525 26.4982 96.4823 25.3142 96.4823H0.086792V112.316H72.4844V96.4823H47.2569C46.0729 96.4823 45.118 95.525 45.118 94.338V18.4258C45.118 17.2388 46.0729 16.2815 47.2569 16.2815H72.4844V0.44812H0.086792V16.2815Z"
        fill={fill}
      />
    </svg>
  );
};

export default LetterI;
