import "antd/dist/reset.css";

import { setup } from "goober";
import { AppProps } from "next/app";
import { createElement } from "react";

setup(createElement);

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
