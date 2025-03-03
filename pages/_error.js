import React from 'react';

function Error({ statusCode }) {
  console.error('status code', statusCode)
  return (
    <div>
      <h1>Something went wrong, but we're on it! Please try again later.</h1>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;