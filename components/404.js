import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link'

export const NotFoundProject = () => {
  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <title>Not found</title>
      </Head>

      <main className="bg-dark_blue h-screen">
        <section className="relative w-full max-w-main mx-auto px-5 sm:px-12 py-32 sm:py-32">
          <h1 className="text-xl">Oops, this project doesn’t exist.</h1>
          <p>
            View some of our{' '}
            <Link href="/work" passHref>
              <a className="underline">case studies</a>
            </Link>{' '}
            instead :)
          </p>
        </section>
      </main>
    </>
  );
};
