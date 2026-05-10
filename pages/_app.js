import '../faust.config';
import { FaustProvider } from '@faustwp/core';
import '@faustwp/core/dist/css/toolbar.css';
import '../styles/global.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <FaustProvider pageProps={pageProps}>
      <Component {...pageProps} />
    </FaustProvider>
  );
}