/* eslint-disable react/prop-types */

import type { AppProps } from "next/app";
import type { FC } from "react";

import { Global } from "@emotion/react";
import tw, { css, GlobalStyles } from "twin.macro";

const App: FC<AppProps> = ({ Component, pageProps }) => (
  <>
    <GlobalStyles />

    <Global
      styles={css`
        body {
          ${tw`min-h-screen`}
        }
      `}
    />

    <Component {...pageProps} />
  </>
);

export default App;
